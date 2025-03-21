

 const countDownDuration = 60000; // 60 seconds
const endTime = Date.now() + countDownDuration;
const countDownElement = document.getElementById('outputt');
const interval = setInterval(function() {
    const remaining = endTime - Date.now();
    const secondsLeft = Math.round(remaining / 1000);
    countDownElement.textContent = "00:"+secondsLeft ;
    if (remaining <= 0) {
        clearInterval(interval);
        countDownElement.textContent = '00:00';
    }
}, 1000);
