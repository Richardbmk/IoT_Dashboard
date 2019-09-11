AWS.config.update({
  region: "us-east-1",
  // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
  endpoint: 'https://dynamodb.us-east-1.amazonaws.com ',
  /*
    accessKeyId and secretAccessKey defaults can be used while using the downloadable version of DynamoDB.
    For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  */
  accessKeyId: "XXXXXXXXXXXXXXXXXXXXXXX",
  secretAccessKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var datumVal = new Date() - 86400000;

function scanTime() {
    document.getElementById('textarea').innerHTML = "";
    document.getElementById('textarea').innerHTML += "Scanning for the sensor data during the last 24 hours." + "\n";

    var params = {
        TableName: "dashboard_table",
        KeyConditionExpression: "#id = :iotTopic AND #ts >= :datum",
        ExpressionAttributeNames: {
            "#id": "id",
            "#ts": "timestamp"
        },
        ExpressionAttributeValues: {
            ":iotTopic": "thing01/data",
            ":datum":  datumVal
        }
    };

    docClient.query(params, onScan);

    function onScan(err, data) {
        if (err) {
            document.getElementById('textarea').innerHTML += "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2);
        } else {
            // Print all the data sensor
            document.getElementById('textarea').innerHTML += "Scan succeeded: " + "\n";
            data.Items.forEach(function(sensor) {
                document.getElementById('textarea').innerHTML += "\n" + sensor.payload.humidity + ": " + sensor.payload.temperature + ": " + sensor.payload.timestamp;
            });
            /*
            // Continue scanning if we have more sensor data (per scan 1mb limitation)
            document.getElementById('textarea').innerHTML += "Scanning for more..." + "\n";
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, onScan);
            */
        }
    }
}

    var params = {
        TableName: "dashboard_table",
        KeyConditionExpression: "#id = :iotTopic AND #ts >= :datum",
        ExpressionAttributeNames: {
            "#id": "id",
            "#ts": "timestamp"
        },
        ExpressionAttributeValues: {
            ":iotTopic": "thing01/data",
            ":datum":  datumVal
        }
    };

var tctx = $("#temperaturegraph").get(0).getContext("2d");
var hctx = $("#humiditygraph").get(0).getContext("2d");


var options = {
    responsive: true,
    showLines: true,
    scales: {
        xAxes: [{
            display: true
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
};


var tinit = {
    labels: [],
    datasets: [
        {
            label: "Temperature °C",
            backgroundColor: 'rgba(204,229,255,0.5)',
            borderColor: "#3e95cd",
            data: []
        }
    ]
};

var hinit = {
    labels: [],
    datasets: [
        {
            label: "Humidity %",
            backgroundColor: 'rgba(229,204,255,0.5)',
            borderColor: "#3e95cd",
            data: []
        }
    ]
};

var temperaturegraph = new Chart.Line(tctx, {data: tinit, options: options});
var humiditygraph = new Chart.Line(hctx, {data: hinit, options: options});


$(function() {
    getData();
    $.ajaxSetup({ cache: false });
    setInterval(getData, 500);
});


function getData() {
    docClient.query(params, function(err, data) {
        if (err) {
            console.log(err);
            return null;
        } else {
        var temperatureValues = [];
        var humidityValues = [];
        //var timeValues = [];
        var labelValues = [];

        var temperatureRead = 0.0;
        var humidityRead = 0.0;
        //timeRead = "";

        for (var i in data['Items']) {
            temperatureRead = parseFloat(data['Items'][i]['payload']['temperature']);
            humidityRead = parseFloat(data['Items'][i]['payload']['humidity']);
            //timeRead = new Date(data['Items'][i]['timestamp']);
            timeRead = data['Items'][i]['payload']['timestamp'];

            temperatureValues.push(temperatureRead);
            humidityValues.push(humidityRead);
            labelValues.push(timeRead);
            }
        }
        temperaturegraph.data.labels = labelValues;
        temperaturegraph.data.datasets[0].data = temperatureValues;
        humiditygraph.data.labels = labelValues;
        humiditygraph.data.datasets[0].data = humidityValues;

        temperaturegraph.update();
        humiditygraph.update();
    });
}



