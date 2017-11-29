 //prefixes of implementation that we want to test
 window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

 //prefixes of window.IDB objects
 window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
 window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

 if (!window.indexedDB) {
     window.alert("Your browser doesn't support a stable version of IndexedDB.")
 }
 var back_but = "<a type='button' onclick='get_stop_info(40230,&quot;blue&quot;,&quot;#00a1de&quot;,&quot;Cumberland (Blue Line) - 30044&quot;,&quot;-87.838028,41.984246&quot;);' class='btn btn-default' style='width:100%;color:white;background-color:#00a1de;'>Cumberland (Blue Line) - 30044</a>";

 const train_stopData = [
     { id: "40230", button: back_but}
 ];
 var db;
 var request = window.indexedDB.open("recentStops", 1);

 request.onerror = function(event) {
     console.log("error: ");
 };

 request.onsuccess = function(event) {
     db = request.result;
     console.log("success: " + db);
 };

 request.onupgradeneeded = function(event) {
     var db = event.target.result;
     var objectStore = db.createObjectStore("train_stop", { keyPath: "id" });

     for (var i in train_stopData) {
         objectStore.add(train_stopData[i]);
     }
 }


 function readAll() {
     var objectStore = db.transaction("train_stop").objectStore("train_stop");
     var counter = 0;
     objectStore.openCursor().onsuccess = function(event) {
         var cursor = event.target.result;

         if (cursor && counter < 5) {
            $("#recents").append(cursor.value.button);
             counter++;
             cursor.continue();
         }

         else {
             "";
         }
     };
 }

 function add(stp_id, button) {
     var request = db.transaction(["train_stop"], "readwrite")
         .objectStore("train_stop")
         .add({ id: stp_id, button: button});

     request.onsuccess = function(event) {
         ""
     };

     request.onerror = function(event) {
		""
     }
 }

 function remove(stp_id) {
     var request = db.transaction(["train_stop"], "readwrite")
         .objectStore("train_stop")
         .delete(stp_id);

     request.onsuccess = function(event) {
		""
     };
 }
 