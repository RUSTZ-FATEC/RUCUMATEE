#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "-";
const char* password = "-";

int port_number = 443;
BearSSL::WiFiClientSecure client;
HTTPClient https;

void setup() {
  Serial.begin(115200);
  delay(1000);
  setup_wifi();

  client.setInsecure();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n\nRealizando Requisição HTTP GET\n");

    String requestUrl = "https://rucumate-api.vercel.app/";
    https.begin(client, requestUrl);

    int httpResponseCode = https.GET();
    Serial.print("Código de Resposta HTTP: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode == HTTP_CODE_OK) {
      String payload = https.getString();
      Serial.println("Carga de Resposta: " + payload);

      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);
      JsonObject obj = doc.as<JsonObject>();

      String value = obj[String("message")];
      Serial.println("\nA resposta é: " + value);
    }
    else {
      Serial.print("Código de Erro: ");
      Serial.println(httpResponseCode);
    }
    // Liberar recursos
    https.end();

  } else {
    Serial.println("WiFi Desconectado");
  }
  delay(10000);
}

void setup_wifi() {
  delay(10);
  // Conectando a rede WiFi
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}
