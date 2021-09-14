(function () {
   function init() { 
        document.getElementById("min-btn").addEventListener("click", function (e) {
             browserWindow.minimize(); 
        });

        document.getElementById("max-btn").addEventListener("click", function (e) {
             browserWindow.maximize(); 
        });

        document.getElementById("close-btn").addEventListener("click", function (e) {
             browserWindow.close();
        }); 
   }; 

   document.onreadystatechange = function () {
        if (document.readyState == "complete") {
             init();
        }
   };
})();