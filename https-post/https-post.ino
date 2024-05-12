#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h> 
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>

#define DHTPIN 2          // D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const char *ssid = "-";
const char *password = "-";

const char *host = "rucumate-api.vercel.app";
const int httpsPort = 443;

const char fingerprint[] PROGMEM = "4C 55 4D FA EF B6 8F 4B A4 20 50 54 EA 57 18 36 89 66 F0 08";

int sensor_id = 1;
int user_id = 14;

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_STA);

  WiFi.begin(ssid, password);
  Serial.println("");

  Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("Conectado em ");
  Serial.println(ssid);
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  WiFiClientSecure httpsClient;

  Serial.println(host);

  Serial.printf("Utilizando SHA1 '%s'\n", fingerprint);
  httpsClient.setFingerprint(fingerprint);
  httpsClient.setTimeout(15000);
  delay(1000);

  Serial.print("Conectando HTTPS");
  int tryConnection = 0;
  while ((!httpsClient.connect(host, httpsPort)) && (tryConnection < 30)) {
    delay(100);
    Serial.print(".");
    tryConnection++;
  }

  if (tryConnection == 30) {
    Serial.println("Falha na conexão");
  } else {
    Serial.println("Sucesso na conexão");
  }

  String jsonData = "{\"sensor_id\": " + String(sensor_id) + ", \"temperature\": " + String(temperature) + ", \"humidity\": " + String(humidity) + ", \"user_id\": " + String(user_id) + "}";

  String Link = "/esp/sensor";
  String httpRequest = String("POST ") + Link + " HTTP/1.1\r\n" +
                       String("Host: ") + host + "\r\n" +
                       "Content-Type: application/json" + "\r\n" +
                       "Content-Length: " + String(jsonData.length()) + "\r\n" +
                       "Connection: close\r\n\r\n" +
                       jsonData + "\r\n";

  Serial.println("Requisitando URL: " + String(host) + Link);

  httpsClient.print(httpRequest);

  Serial.println("Requisição enviada");

  while (httpsClient.connected()) {
    String line = httpsClient.readStringUntil('\n');
    if (line == "\r") {
      Serial.println("Headers recebido");
      break;
    }
  }

  Serial.println("Retorno da requisição:");
  Serial.println("==========");
  String line;
  while (httpsClient.available()) {
    line = httpsClient.readStringUntil('\n');
    Serial.println(line);
  }
  Serial.println("==========");
  Serial.println("Fechando conexão");

  delay(60000);
}
