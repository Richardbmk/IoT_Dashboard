import Adafruit_DHT
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from time import sleep
from datetime import date, datetime


# AWS IoT certificate based connection
myMQTTClient = AWSIoTMQTTClient("")
myMQTTClient.configureEndpoint("xxxxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com", 8883)
myMQTTClient.configureCredentials("certs/xxxxx_root.crt", "certs/xxxxxxxxx-private.pem.key",
                                  "certs/xxxxxxxxxxx-certificate.pem.crt")
myMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# connect and publish
myMQTTClient.connect()
myMQTTClient.publish("thing01/info", "connected", 0)


sensor = Adafruit_DHT.DHT22
pin = 17 # GPIO 17



# loop and publish sensor reading
while 1:
    now = datetime.utcnow()
    now_str = now.strftime('%Y-%m-%dT%H:%M:%SZ')  # e.g. 2016-04-18T06:12:25.877Z
    humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
    if humidity is not None and temperature is not None:
        payload = '{ "timestamp": "' + now_str + '","temperature": ' + str(temperature) + ',"humidity": ' + str(humidity) + ' }'
        print(payload)
        myMQTTClient.publish("thing01/data", payload, 0)
        sleep(4)
    else:
        print(".")
        sleep(1)