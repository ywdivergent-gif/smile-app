// Initialize app
document.addEventListener('DOMContentLoaded', init);

// Navigation
document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        goToPage(e.target.dataset.page);
    });
});

// Set today's date as default
const today = new Date().toISOString().split('T')[0];

function init() {
    loadAllData();
    updateHomePageSummary();
    displayWorkoutProgress();
    displayTradeProgress();
    displayReadingProgress();
    setDefaultDates();
}

function setDefaultDates() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) input.value = today;
    });
}

function goToPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

    // Show selected page
    document.getElementById(pageName).classList.add('active');

    // Update sidebar buttons
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.sidebar-btn[data-page="${pageName}"]`).classList.add('active');

    // Refresh data
    if (pageName === 'home') {
        updateHomePageSummary();
    } else if (pageName === 'workout') {
        displayWorkoutProgress();
    } else if (pageName === 'tracker') {
        displayTradeProgress();
    } else if (pageName === 'reading') {
        displayReadingProgress();
    }
}

// ===== WORKOUT LOGIC =====
const workoutGoals = {
    weight: { goal: 70, unit: 'kg' },
    pullup: { weight: 40, reps: 8, unit: 'kg' },
    dips: { weight: 40, reps: 8, unit: 'kg' },
    bench: { weight: 40, reps: 8, unit: 'kg' },
    lat: { weight: 100, reps: 8, unit: 'kg' },
    squat: { weight: 80, reps: 8, unit: 'kg' },
    marathon: { goal: 13.1, unit: 'miles', goalDate: '2026-08-31' }
};

function saveWorkoutData(exercise) {
    const data = {};

    if (exercise === 'weight') {
        data.value = document.getElementById('weight-input').value;
        data.date = document.getElementById('weight-date').value;
    } else if (exercise === 'marathon') {
        data.distance = document.getElementById('marathon-distance').value;
        data.date = document.getElementById('marathon-date').value;
    } else {
        data.weight = document.getElementById(`${exercise}-weight`).value;
        data.reps = document.getElementById(`${exercise}-reps`).value;
        data.date = document.getElementById(`${exercise}-date`).value;
    }

    if (Object.values(data).some(v => v === '')) {
        alert('Please fill in all fields');
        return;
    }

    let workout = JSON.parse(localStorage.getItem('workout')) || {};
    workout[exercise] = data;
    localStorage.setItem('workout', JSON.stringify(workout));

    displayWorkoutProgress();
    alert('Workout data saved!');
}

function displayWorkoutProgress() {
    const workout = JSON.parse(localStorage.getItem('workout')) || {};

    // Weight
    if (workout.weight) {
        const weight = parseFloat(workout.weight.value);
        const goal = workoutGoals.weight.goal;
        const diff = (goal - weight).toFixed(1);
        const status = weight <= goal ? '✓ Goal achieved!' : `${diff}kg away`;
        document.getElementById('weight-display').textContent =
            `${weight}kg (${status}) - Last: ${formatDate(workout.weight.date)}`;
        document.getElementById('weight-display').className = weight <= goal ? 'progress-display achieved' : 'progress-display';
    }

    // Exercises
    ['pullup', 'dips', 'bench', 'lat', 'squat'].forEach(exercise => {
        if (workout[exercise]) {
            const w = parseFloat(workout[exercise].weight);
            const r = parseInt(workout[exercise].reps);
            const goal = workoutGoals[exercise];
            const weightMatch = w >= goal.weight;
            const repsMatch = r >= goal.reps;
            const status = (weightMatch && repsMatch) ? '✓ Goal achieved!' : 'In progress';
            document.getElementById(`${exercise}-display`).textContent =
                `${w}kg × ${r} reps (${status}) - Last: ${formatDate(workout[exercise].date)}`;
            document.getElementById(`${exercise}-display`).className = (weightMatch && repsMatch) ? 'progress-display achieved' : 'progress-display';
        }
    });

    // Marathon
    if (workout.marathon) {
        const distance = parseFloat(workout.marathon.distance);
        const goal = workoutGoals.marathon.goal;
        const daysLeft = calculateDaysLeft('2026-08-31');
        const status = distance >= goal ? '✓ Goal achieved!' : `${(goal - distance).toFixed(1)} miles away`;
        document.getElementById('marathon-display').textContent =
            `${distance} miles (${status}) - ${daysLeft} days until deadline`;
        document.getElementById('marathon-display').className = distance >= goal ? 'progress-display achieved' : 'progress-display';
    }
}

function calculateDaysLeft(goalDate) {
    const goal = new Date(goalDate);
    const today = new Date();
    const diff = goal - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ===== READING LOGIC =====
function saveReading(book) {
    let data = {};

    if (book === 'principles') {
        data.page = document.getElementById('principles-page').value;
        data.total = document.getElementById('principles-total').value;
    } else if (book === 'habits') {
        data.page = document.getElementById('habits-page').value;
        data.total = document.getElementById('habits-total').value;
    } else if (book === 'power') {
        data.chapter = document.getElementById('power-chapter').value;
        data.total = document.getElementById('power-total').value;
    }

    if (Object.values(data).some(v => v === '')) {
        alert('Please fill in all fields');
        return;
    }

    let reading = JSON.parse(localStorage.getItem('reading')) || {};
    reading[book] = data;
    localStorage.setItem('reading', JSON.stringify(reading));

    displayReadingProgress();
    alert('Reading progress saved!');
}

function displayReadingProgress() {
    const reading = JSON.parse(localStorage.getItem('reading')) || {};

    const books = [
        { id: 'principles', pageId: 'principles-page', totalId: 'principles-total', displayId: 'principles-display', type: 'pages' },
        { id: 'habits', pageId: 'habits-page', totalId: 'habits-total', displayId: 'habits-display', type: 'pages' },
        { id: 'power', pageId: 'power-chapter', totalId: 'power-total', displayId: 'power-display', type: 'chapters' }
    ];

    books.forEach(book => {
        const bookData = reading[book.id];

        // Load saved data into inputs
        if (bookData) {
            const pageInput = document.getElementById(book.pageId);
            const totalInput = document.getElementById(book.totalId);

            if (book.type === 'pages') {
                if (pageInput) pageInput.value = bookData.page || '';
            } else {
                if (pageInput) pageInput.value = bookData.chapter || '';
            }
            if (totalInput) totalInput.value = bookData.total || '';

            // Update display
            const current = parseInt(bookData.page || bookData.chapter);
            const total = parseInt(bookData.total);
            const unit = book.type === 'pages' ? 'pages' : 'chapters';

            if (total > 0) {
                const percent = ((current / total) * 100).toFixed(1);
                document.getElementById(book.displayId).textContent =
                    `${current} / ${total} ${unit} (${percent}% complete)`;
            } else {
                document.getElementById(book.displayId).textContent = 'Add total to see progress';
            }
        } else {
            // Empty state message
            document.getElementById(book.displayId).textContent = 'Start tracking your progress';
        }
    });
}

// ===== TRADE TRACKER LOGIC =====
function addTrade() {
    const size = parseInt(document.getElementById('trade-size').value);
    const profit = parseFloat(document.getElementById('trade-profit').value);

    if (!profit || profit <= 0) {
        alert('Please enter a valid profit amount');
        return;
    }

    let trades = JSON.parse(localStorage.getItem('trades')) || [];
    trades.push({
        size,
        profit,
        date: today,
        id: Date.now()
    });

    localStorage.setItem('trades', JSON.stringify(trades));
    document.getElementById('trade-profit').value = '';
    displayTradeProgress();
    alert('Trade logged!');
}

function displayTradeProgress() {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    const goal = 30000;

    // Calculate totals by size
    const bySize = {
        50: { earned: 0, count: 0 },
        100: { earned: 0, count: 0 },
        500: { earned: 0, count: 0 },
        1000: { earned: 0, count: 0 }
    };

    let totalEarned = 0;

    trades.forEach(trade => {
        bySize[trade.size].earned += trade.profit;
        bySize[trade.size].count += 1;
        totalEarned += trade.profit;
    });

    // Update overall progress
    document.getElementById('total-earned').textContent = Math.round(totalEarned);
    const progressPercent = (totalEarned / goal) * 100;
    document.getElementById('overall-progress').style.width = Math.min(progressPercent, 100) + '%';
    document.getElementById('progress-percentage').textContent = `${progressPercent.toFixed(1)}% complete`;

    // Update breakdown cards
    [50, 100, 500, 1000].forEach(size => {
        const earned = bySize[size].earned;
        const count = bySize[size].count;
        const needed = Math.ceil((goal - totalEarned) / size);
        const progressPercent = (earned / goal) * 100;

        document.getElementById(`earned-${size}`).textContent = Math.round(earned);
        document.getElementById(`count-${size}`).textContent = count;
        document.getElementById(`needed-${size}`).textContent = needed;
        document.getElementById(`progress-${size}`).style.width = Math.min(progressPercent, 100) + '%';
    });

    // Update trade history
    displayTradeHistory(trades);
}

function displayTradeHistory(trades) {
    const historyDiv = document.getElementById('trade-history');

    if (trades.length === 0) {
        historyDiv.innerHTML = '<p class="empty-state">No trades logged yet</p>';
        return;
    }

    // Sort by date, newest first
    const sortedTrades = [...trades].sort((a, b) => b.date.localeCompare(a.date));

    historyDiv.innerHTML = sortedTrades.map(trade => `
        <div class="trade-item">
            <div class="trade-item-left">
                <div class="trade-item-size">${trade.size} Trade</div>
                <div class="trade-item-date">${formatDate(trade.date)}</div>
            </div>
            <div class="trade-item-profit">+${Math.round(trade.profit)}</div>
        </div>
    `).join('');
}

// ===== HOME PAGE SUMMARY =====
function updateHomePageSummary() {
    updateWorkoutSummary();
    updateTrackerSummary();
    updateReadingSummary();
}

function updateReadingSummary() {
    const reading = JSON.parse(localStorage.getItem('reading')) || {};
    const summaryDiv = document.getElementById('home-reading-summary');

    const books = [
        { id: 'principles', name: 'Principles', type: 'pages' },
        { id: 'habits', name: 'Atomic Habits', type: 'pages' },
        { id: 'power', name: 'Power', type: 'chapters' }
    ];

    let html = '';

    books.forEach(book => {
        const data = reading[book.id];
        let currentVal = '—';
        let totalVal = '—';
        let pct = 0;

        if (data) {
            const current = parseInt(book.type === 'pages' ? (data.page || 0) : (data.chapter || 0));
            const total = parseInt(data.total || 0);
            const unit = book.type === 'pages' ? 'p' : 'ch';
            currentVal = `${current}${unit}`;
            totalVal = total > 0 ? `${total}${unit}` : '—';
            if (total > 0) {
                pct = Math.min(Math.round((current / total) * 100), 100);
            }
        }

        html += `<div class="goal-item">
            <span class="goal-item-name">${book.name}</span>
            <span class="goal-item-current">${currentVal}</span>
            <span class="goal-item-goal">${totalVal}</span>
            <span class="goal-item-pct">${pct > 0 ? pct + '%' : '—'}</span>
        </div>`;
    });

    if (!html) {
        html = '<p class="empty-state">No books tracked yet</p>';
    }

    summaryDiv.innerHTML = html;
}

function calculateCountdown(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}

function updateWorkoutSummary() {
    const workout = JSON.parse(localStorage.getItem('workout')) || {};
    const summaryDiv = document.getElementById('home-workout-summary');
    const goalDate = '2026-09-01';
    const daysLeft = calculateCountdown(goalDate);

    let summaryHTML = '';

    // Add header with goal label
    summaryHTML += `<div class="goal-item goal-header">
        <span class="goal-item-name" style="grid-column: 1;"></span>
        <span class="goal-item-current" style="grid-column: 2;">Current</span>
        <span class="goal-item-goal" style="grid-column: 3;">Goal</span>
        <span class="goal-item-pct" style="grid-column: 4;"></span>
    </div>`;

    // Weight
    if (workout.weight) {
        const weight = parseFloat(workout.weight.value);
        const goal = workoutGoals.weight.goal;
        // For weight, closer to goal = better. Calculate how close.
        const pct = goal > 0 ? Math.min(Math.round((1 - Math.abs(weight - goal) / goal) * 100), 100) : 0;
        summaryHTML += `<div class="goal-item">
            <span class="goal-item-name">Weight</span>
            <span class="goal-item-current">${weight}kg</span>
            <span class="goal-item-goal">${goal}kg</span>
            <span class="goal-item-pct">${Math.max(pct, 0)}%</span>
        </div>`;
    }

    // Exercises
    ['pullup', 'dips', 'bench', 'lat', 'squat'].forEach(exercise => {
        if (workout[exercise]) {
            const w = parseFloat(workout[exercise].weight);
            const r = parseInt(workout[exercise].reps);
            const goal = workoutGoals[exercise];
            const name = exercise.charAt(0).toUpperCase() + exercise.slice(1);
            // Average of weight % and reps %
            const weightPct = goal.weight > 0 ? (w / goal.weight) * 100 : 0;
            const repsPct = goal.reps > 0 ? (r / goal.reps) * 100 : 0;
            const pct = Math.min(Math.round((weightPct + repsPct) / 2), 100);
            summaryHTML += `<div class="goal-item">
                <span class="goal-item-name">${name}</span>
                <span class="goal-item-current">${w}kg, ${r} Reps</span>
                <span class="goal-item-goal">${goal.weight}kg, ${goal.reps} Reps</span>
                <span class="goal-item-pct">${pct}%</span>
            </div>`;
        }
    });

    // Marathon
    if (workout.marathon) {
        const distance = parseFloat(workout.marathon.distance);
        const goalDist = 13.1;
        const pct = Math.min(Math.round((distance / goalDist) * 100), 100);
        summaryHTML += `<div class="goal-item">
            <span class="goal-item-name">Half Marathon</span>
            <span class="goal-item-current">${distance}mi</span>
            <span class="goal-item-goal">13.1mi</span>
            <span class="goal-item-pct">${pct}%</span>
        </div>`;
    }

    // Add countdown
    summaryHTML += `<div class="countdown-section">
        <div class="countdown-text">September 1st • ${daysLeft} days left</div>
    </div>`;

    if (summaryHTML === '') {
        summaryHTML = '<p style="color: var(--text-secondary); font-size: 0.95rem;">No workout data yet. Start logging to see your progress!</p>';
    }

    summaryDiv.innerHTML = summaryHTML;
}

function updateTrackerSummary() {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    const summaryDiv = document.getElementById('home-trade-summary');
    const yearEndDate = '2026-12-31';
    const daysLeft = calculateCountdown(yearEndDate);

    let totalEarned = 0;
    trades.forEach(trade => {
        totalEarned += trade.profit;
    });

    const goal = 30000;
    const progressPercent = ((totalEarned / goal) * 100).toFixed(1);
    const remaining = goal - totalEarned;

    let html = `
        <div class="goal-item goal-header">
            <span class="goal-item-name" style="grid-column: 1;"></span>
            <span class="goal-item-current" style="grid-column: 2;">Current</span>
            <span class="goal-item-goal" style="grid-column: 3;">Goal</span>
            <span class="goal-item-pct" style="grid-column: 4;"></span>
        </div>
        <div class="goal-item">
            <span class="goal-item-name">Earnings</span>
            <span class="goal-item-current">$${Math.round(totalEarned).toLocaleString()}</span>
            <span class="goal-item-goal">$30,000</span>
            <span class="goal-item-pct">${progressPercent}%</span>
        </div>
        <div class="progress-bar" style="margin-top: 0.75rem; margin-bottom: 0.5rem;">
            <div class="progress-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
        </div>
        <div class="countdown-section">
            <div class="countdown-text">End of Year • ${daysLeft} days left</div>
        </div>
    `;

    summaryDiv.innerHTML = html;
}

// ===== UTILITIES =====
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function loadAllData() {
    // Data loads automatically from localStorage
}

// Set initial dates on page load
window.addEventListener('load', () => {
    document.querySelectorAll('input[type="date"]:not([value])').forEach(input => {
        input.value = today;
    });
});
