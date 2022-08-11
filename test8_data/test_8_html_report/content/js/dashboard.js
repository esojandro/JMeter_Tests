/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 94.55099707862314, "KoPercent": 5.449002921376858};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.48158262415851644, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6110736558233608, 500, 1500, "Blazedemo/reserva"], "isController": false}, {"data": [0.03185233583796145, 500, 1500, "Blazedemo/Homepage"], "isController": false}, {"data": [0.6477136495975339, 500, 1500, "Blazedemo/compra"], "isController": false}, {"data": [0.6588646288209608, 500, 1500, "Blazedemo/confirma"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 23619, 1287, 5.449002921376858, 4152.329819213348, 6, 200835, 1149.0, 11828.0, 17362.0, 50582.62000000022, 79.78583251697464, 125.9860467319613, 47.850671806911464], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Blazedemo/reserva", 5933, 191, 3.2192819821338277, 3166.8255519973063, 43, 192089, 433.0, 7802.400000000005, 13155.300000000003, 42651.97999999994, 20.123665742961126, 30.557359962367762, 11.944160261780638], "isController": false}, {"data": ["Blazedemo/Homepage", 6122, 843, 13.77000980071872, 7026.428781443982, 6, 53804, 5079.0, 13903.199999999999, 18244.249999999996, 27784.439999999966, 20.680476171172995, 31.95438464646925, 7.749593550905657], "isController": false}, {"data": ["Blazedemo/compra", 5839, 142, 2.4319232745333106, 3315.872409659184, 69, 200835, 391.0, 4877.0, 13275.0, 60855.200000000026, 19.82157527038679, 34.27168549692272, 12.955974043801643], "isController": false}, {"data": ["Blazedemo/confirma", 5725, 111, 1.9388646288209608, 2953.3495196506487, 74, 197528, 389.0, 4175.400000000001, 9345.499999999993, 61044.979999999996, 19.45492235022258, 29.671517653855304, 15.404668623840351], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Se produjo un error durante el intento de conexi&Atilde;&sup3;n ya que la parte conectada no respondi&Atilde;&sup3; adecuadamente tras un periodo de tiempo, o bien se produjo un error en la conexi&Atilde;&sup3;n establecida ya que el host conectado no ha podido responder", 8, 0.6216006216006216, 0.03387103603031458], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, 0.0777000777000777, 0.004233879503789322], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 500, 38.85003885003885, 2.116939751894661], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: blazedemo.com:443 failed to respond", 545, 42.34654234654235, 2.3074643295651804], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 233, 18.104118104118104, 0.9864939243829121], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 23619, 1287, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: blazedemo.com:443 failed to respond", 545, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 500, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 233, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se produjo un error durante el intento de conexi&Atilde;&sup3;n ya que la parte conectada no respondi&Atilde;&sup3; adecuadamente tras un periodo de tiempo, o bien se produjo un error en la conexi&Atilde;&sup3;n establecida ya que el host conectado no ha podido responder", 8, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Blazedemo/reserva", 5933, 191, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 94, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: blazedemo.com:443 failed to respond", 60, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 33, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se produjo un error durante el intento de conexi&Atilde;&sup3;n ya que la parte conectada no respondi&Atilde;&sup3; adecuadamente tras un periodo de tiempo, o bien se produjo un error en la conexi&Atilde;&sup3;n establecida ya que el host conectado no ha podido responder", 4, "", ""], "isController": false}, {"data": ["Blazedemo/Homepage", 6122, 843, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: blazedemo.com:443 failed to respond", 458, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 195, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 189, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", ""], "isController": false}, {"data": ["Blazedemo/compra", 5839, 142, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 114, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: blazedemo.com:443 failed to respond", 20, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se produjo un error durante el intento de conexi&Atilde;&sup3;n ya que la parte conectada no respondi&Atilde;&sup3; adecuadamente tras un periodo de tiempo, o bien se produjo un error en la conexi&Atilde;&sup3;n establecida ya que el host conectado no ha podido responder", 3, "", ""], "isController": false}, {"data": ["Blazedemo/confirma", 5725, 111, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 103, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: blazedemo.com:443 failed to respond", 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Se produjo un error durante el intento de conexi&Atilde;&sup3;n ya que la parte conectada no respondi&Atilde;&sup3; adecuadamente tras un periodo de tiempo, o bien se produjo un error en la conexi&Atilde;&sup3;n establecida ya que el host conectado no ha podido responder", 1, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
