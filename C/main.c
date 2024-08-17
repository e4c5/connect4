#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <curl/curl.h>
#include <json-c/json.h>
#include <avro.h>

#define BUFFER_SIZE 1024
#define START_PATH_COMPONENT "/start/"
#define MOVE_PATH_COMPONENT "/move/"
#define DEFAULT_CONTENT_TYPE "json"

// Callback function to write response data
size_t write_callback(void *ptr, size_t size, size_t nmemb, void *userdata) {
    strncat((char *)userdata, (char *)ptr, size * nmemb);
    return size * nmemb;
}

// Function to parse and display the board from JSON response
size_t parse_json_response(const char *response) {
    struct json_object *parsed_json;
    struct json_object *board;
    struct json_object *row;
    size_t n_rows;
    size_t n_cols = 0;

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
    return n_cols;
}

// Function to parse and display the board from AVRO response
size_t parse_avro_response(const char *response, size_t response_size) {
    avro_schema_t schema;
    avro_value_iface_t *iface;
    avro_value_t value;
    avro_reader_t reader;
    size_t n_cols = 0;

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
        return 0;
    }

    // Extract and print the board
    avro_value_t board_value;
    avro_value_get_by_name(&value, "board", &board_value, NULL);
    size_t n_rows;
    avro_value_get_size(&board_value, &n_rows);
    for (size_t i = 0; i < n_rows; i++) {
        avro_value_t row_value;
        avro_value_get_by_index(&board_value, i, &row_value, NULL);
        avro_value_get_size(&row_value, &n_cols);
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

    return n_cols;
}

// Function to send a POST request with the column number
void send_post_request(const char *base_url, int column, CURL *curl, const char *cookie) {
    CURLcode res;
    char url[BUFFER_SIZE];
    char response[BUFFER_SIZE] = {0};
    struct json_object *json_obj = json_object_new_object();
    json_object_object_add(json_obj, "column", json_object_new_int(column));
    const char *json_str = json_object_to_json_string(json_obj);

    snprintf(url, BUFFER_SIZE, "%s%s", base_url, MOVE_PATH_COMPONENT);

    if (curl) {
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        // Set the URL and headers
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_str);

        // Set the cookie
        curl_easy_setopt(curl, CURLOPT_COOKIE, cookie);

        // Enable verbose output to see headers
        curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

        // Perform the request
        res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }

        // Clean up
        curl_slist_free_all(headers);
    }

    json_object_put(json_obj);
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Error: Server URL is required.\n");
        return 1;
    }

    const char *base_url = argv[1];
    const char *content_type = (argc > 2) ? argv[2] : DEFAULT_CONTENT_TYPE;

    char url[BUFFER_SIZE];
    snprintf(url, BUFFER_SIZE, "%s%s", base_url, START_PATH_COMPONENT);

    CURL *curl;
    CURLcode res;
    char response[BUFFER_SIZE] = {0};
    size_t n_cols = 0;
    struct curl_slist *cookies = NULL;
    struct curl_slist *nc;
    char cookie_string[BUFFER_SIZE] = {0};

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

        // Enable verbose output to see headers
        curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

        // Perform the first request
        res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            if (strcmp(content_type, "json") == 0) {
                n_cols = parse_json_response(response);
            } else if (strcmp(content_type, "avro") == 0) {
                n_cols = parse_avro_response(response, strlen(response));
            } else {
                printf("Content type %s is not yet supported.\n", content_type);
            }

            // Capture cookies
            res = curl_easy_getinfo(curl, CURLINFO_COOKIELIST, &cookies);
            if (res == CURLE_OK && cookies) {
                printf("Cookies:\n");
                for (nc = cookies; nc; nc = nc->next) {
                    printf("%s\n", nc->data);
                    // Directly use the cookie string
                    strncat(cookie_string, nc->data, BUFFER_SIZE - strlen(cookie_string) - 1);
                    strncat(cookie_string, "; ", BUFFER_SIZE - strlen(cookie_string) - 1);
                }
                curl_slist_free_all(cookies);
            }

            if (n_cols > 0) {
                int column = 0;
                printf("Enter the column number to play: ");
                scanf("%d", &column);
                send_post_request(base_url, column, curl, cookie_string);
            }
        }

        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }

    curl_global_cleanup();
    return 0;
}