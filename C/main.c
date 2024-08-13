/**
 * C web based game client.
 * 
 * This program will accept two arguments the server url and the content type.
 * the content type can be one of json,protobuf,avro and messagePack, if left
 * blank it will default to json.
 * 
 * If the url is not provided the program will exit with an error.
 * 
 * One startup, the app will connect to the url provided over HTTP, it will send
 * the accept http header that tallies with the second argument. It will then
 * parse the response and display a board.
 * 
 * In case of json the response from the server will look like {"board": [ [0,0,0 ..], [0,0,0, ..] .. ] }
 * while the other contents types will have a corresponding structure
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <json-c/json.h>
#include <avro.h>

#define DEFAULT_CONTENT_TYPE "json"
#define BUFFER_SIZE 1024

// Function to handle errors
void handle_error(const char *message) {
    fprintf(stderr, "%s\n", message);
    exit(EXIT_FAILURE);
}

// Function to write response data to a buffer
size_t write_callback(void *ptr, size_t size, size_t nmemb, char *data) {
    size_t total_size = size * nmemb;
    strncat(data, ptr, total_size);
    return total_size;
}

// Function to parse and display the board from JSON response
void parse_json_response(const char *response) {
    struct json_object *parsed_json;
    struct json_object *board;
    struct json_object *row;
    size_t n_rows, n_cols;

    parsed_json = json_tokener_parse(response);
    json_object_object_get_ex(parsed_json, "board", &board);

    n_rows = json_object_array_length(board);
    for (size_t i = 0; i < n_rows; i++) {
        row = json_object_array_get_idx(board, i);
        n_cols = json_object_array_length(row);
        for (size_t j = 0; j < n_cols; j++) {
            printf("%d ", json_object_get_int(json_object_array_get_idx(row, j)));
        }
        printf("\n");
    }
}

// Function to parse and display the board from AVRO response
void parse_avro_response(const char *response, size_t response_size) {
    avro_schema_t schema;
    avro_value_iface_t *iface;
    avro_value_t value;
    avro_reader_t reader;

    // Parse the schema
    const char *schema_json = "{\"type\":\"record\",\"name\":\"Connect4State\",\"fields\":[{\"name\":\"board\",\"type\":{\"type\":\"array\",\"items\":{\"type\":\"array\",\"items\":\"int\"}}},{\"name\":\"playing\",\"type\":\"boolean\"},{\"name\":\"winner\",\"type\":[\"null\",\"int\"],\"default\":null},{\"name\":\"message\",\"type\":[\"null\",\"string\"],\"default\":null}]}";
    avro_schema_from_json_literal(schema_json, &schema);

    // Create a value interface and value
    iface = avro_generic_class_from_schema(schema);
    avro_generic_value_new(iface, &value);

    // Create a memory reader
    reader = avro_reader_memory(response, response_size);

    // Read the value from the reader
    if (avro_value_read(reader, &value)) {
        fprintf(stderr, "Unable to read AVRO value\n");
        avro_value_decref(&value);
        avro_value_iface_decref(iface);
        avro_schema_decref(schema);
        avro_reader_free(reader);
        return;
    }

    // Extract and print the board
    avro_value_t board_value;
    avro_value_get_by_name(&value, "board", &board_value, NULL);
    size_t n_rows = avro_value_get_size(&board_value);
    for (size_t i = 0; i < n_rows; i++) {
        avro_value_t row_value;
        avro_value_get_by_index(&board_value, i, &row_value, NULL);
        size_t n_cols = avro_value_get_size(&row_value);
        for (size_t j = 0; j < n_cols; j++) {
            avro_value_t cell_value;
            avro_value_get_by_index(&row_value, j, &cell_value, NULL);
            int cell;
            avro_value_get_int(&cell_value, &cell);
            printf("%d ", cell);
        }
        printf("\n");
    }

    // Clean up
    avro_value_decref(&value);
    avro_value_iface_decref(iface);
    avro_schema_decref(schema);
    avro_reader_free(reader);
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        handle_error("Error: Server URL is required.");
    }

    const char *url = argv[1];
    const char *content_type = (argc > 2) ? argv[2] : DEFAULT_CONTENT_TYPE;

    CURL *curl;
    CURLcode res;
    char response[BUFFER_SIZE] = {0};

    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    if (curl) {
        struct curl_slist *headers = NULL;
        char accept_header[BUFFER_SIZE];

        snprintf(accept_header, BUFFER_SIZE, "Accept: application/%s", content_type);
        headers = curl_slist_append(headers, accept_header);

        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_callback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, response);

        res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            if (strcmp(content_type, "json") == 0) {
                parse_json_response(response);
            } else if (strcmp(content_type, "avro") == 0) {
                parse_avro_response(response, strlen(response));
            } else {
                printf("Content type %s is not yet supported.\n", content_type);
            }
        }

        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }

    curl_global_cleanup();
    return 0;
}