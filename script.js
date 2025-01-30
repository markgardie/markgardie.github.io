// Елементи інтерфейсу
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const completedSessionsDisplay = document.getElementById('completedSessions');
const totalWorkTimeDisplay = document.getElementById('totalWorkTime');
const progressRing = document.querySelector('.progress-ring-circle');

// Константи для анімації
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 45; // r = 45 з SVG
progressRing.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
progressRing.style.strokeDashoffset = 0;

// Змінні стану
let timeLeft;
let timerId = null;
let isWorkTime = true;
let completedSessions = parseInt(localStorage.getItem('completedSessions')) || 0;
let totalWorkTime = parseInt(localStorage.getItem('totalWorkTime')) || 0;

// Оновлення статистики
function updateStatistics() {
    completedSessionsDisplay.textContent = completedSessions;
    totalWorkTimeDisplay.textContent = `${totalWorkTime} хв`;
    localStorage.setItem('completedSessions', completedSessions);
    localStorage.setItem('totalWorkTime', totalWorkTime);
}

// Оновлення прогрес-кільця
function updateProgress(timeLeft, totalTime) {
    const progress = timeLeft / totalTime;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    
    anime({
        targets: '.progress-ring-circle',
        strokeDashoffset: offset,
        easing: 'linear',
        duration: 1000
    });
}

// Форматування часу
function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return {
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    };
}

// Оновлення дисплею
function updateDisplay(timeInSeconds) {
    const { minutes, seconds } = formatTime(timeInSeconds);
    minutesDisplay.textContent = minutes;
    secondsDisplay.textContent = seconds;
}

// Перемикання між роботою та відпочинком
function toggleMode() {
    isWorkTime = !isWorkTime;
    if (!isWorkTime) {
        completedSessions++;
        totalWorkTime += parseInt(workTimeInput.value);
        updateStatistics();
        
        anime({
            targets: '.timer-circle',
            scale: [1.2, 1],
            duration: 1000,
            easing: 'easeOutElastic(1, .5)'
        });
    }
    
    timeLeft = (isWorkTime ? parseInt(workTimeInput.value) : parseInt(breakTimeInput.value)) * 60;
    updateDisplay(timeLeft);
    
    // Зміна кольору прогрес-кільця
    anime({
        targets: '.progress-ring-circle',
        stroke: isWorkTime ? '#e74c3c' : '#2ecc71',
        duration: 500,
        easing: 'easeInOutQuad'
    });
}

// Основний таймер
function startTimer() {
    if (timerId !== null) return;
    
    const totalTime = timeLeft;
    
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay(timeLeft);
        updateProgress(timeLeft, totalTime);
        
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerId = null;
            
            // Звукове сповіщення
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Ff4B7gIZyeXNrb2p0cnh3eHp7gYR/gIGEgH+Eh3+AgoaChoV/g4eMjI+Nj4yQkpOQkpSTlJKSkZAPD4SDhoeJhIaJioiHiomLiouJi4qKi4mJioiKiYeLioeLjIqIiYuKiouJiYqKioqHhw');
            audio.play();
            
            toggleMode();
            startTimer();
        }
    }, 1000);
    
    startButton.disabled = true;
    pauseButton.disabled = false;
}

// Пауза таймера
function pauseTimer() {
    if (timerId === null) return;
    
    clearInterval(timerId);
    timerId = null;
    
    startButton.disabled = false;
    pauseButton.disabled = true;
}

// Скидання таймера
function resetTimer() {
    pauseTimer();
    isWorkTime = true;
    timeLeft = parseInt(workTimeInput.value) * 60;
    updateDisplay(timeLeft);
    updateProgress(timeLeft, timeLeft);
    
    anime({
        targets: '.progress-ring-circle',
        stroke: '#e74c3c',
        strokeDashoffset: 0,
        duration: 500,
        easing: 'easeInOutQuad'
    });
}

// Ініціалізація
function init() {
    // Встановлення початкових значень
    timeLeft = parseInt(workTimeInput.value) * 60;
    updateDisplay(timeLeft);
    updateStatistics();
    
    // Обробники подій для кнопок
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    
    // Обробники подій для інпутів
    workTimeInput.addEventListener('change', () => {
        if (timerId === null && isWorkTime) {
            timeLeft = parseInt(workTimeInput.value) * 60;
            updateDisplay(timeLeft);
            updateProgress(timeLeft, timeLeft);
        }
    });
    
    breakTimeInput.addEventListener('change', () => {
        if (timerId === null && !isWorkTime) {
            timeLeft = parseInt(breakTimeInput.value) * 60;
            updateDisplay(timeLeft);
            updateProgress(timeLeft, timeLeft);
        }
    });
}

// Запуск програми
init();