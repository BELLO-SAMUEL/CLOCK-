<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <title>My clock</title>
</head>


<body>
 <div id="clock"></div>
 <br>
</body>
</html>
<style>
 
 body{
 display: flex;
 align-items: center;
 height: 100vh;
 justify-content: center;
 background: repeating-radial-gradient(circle, #ff00ee, #00fff7 100%);
 font-family: Arial, sans-serif;
}
#clock{
 font-size: 4.5rem;
 font-weight: 1000;
 padding: 30px 40px;
 border-radius: 19px;
 border: 5px solid rgb(300, 300, 300);
 color: #00ffee;
}

</style>
<script>
 
 function updateClock(){
 var now = new Date();
 var hours = now.getHours();
 var minutes = now.getMinutes();
 var seconds = now.getSeconds();
 
 hours = hours < 10 ? "0" + hours : hours;
 minutes = minutes < 10 ? "0" + minutes : minutes;
 seconds = seconds < 10 ? "0" + seconds : seconds;
 
 var timeString = hours + ":" + minutes + ":" + seconds;
 document.getElementById("clock").innerHTML = timeString;
 }
 
setInterval(updateClock, 1000);
updateClock();
 
</script>