// List of all IANA timezone identifiers
const ALL_TIMEZONES = [
    'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Cairo', 'Africa/Nairobi',
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'America/Toronto', 'America/Mexico_City', 'America/Buenos_Aires', 'America/Santiago',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore',
    'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Manila', 'Asia/Seoul',
    'Asia/Kolkata', 'Asia/Dubai', 'Asia/Bangkok', 'Asia/Istanbul',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Europe/Amsterdam', 'Europe/Rome', 'Europe/Madrid', 'Europe/Vienna',
    'Pacific/Auckland', 'Pacific/Sydney', 'Pacific/Fiji', 'Pacific/Honolulu',
    'Australia/Melbourne', 'Australia/Perth', 'Australia/Brisbane',
    'UTC', 'GMT'
];

// Default timezones to display
const DEFAULT_TIMEZONES = [
    'UTC',
    'Europe/London',
    'Asia/Tokyo',
    'America/New_York',
    'Australia/Sydney'
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clocksContainer = document.getElementById('clocksContainer');
const suggestionsDiv = document.getElementById('suggestions');
const format24Btn = document.getElementById('format24');
const format12Btn = document.getElementById('format12');
const resetBtn = document.getElementById('resetBtn');

// State
let activeTimezones = [...DEFAULT_TIMEZONES];
let is24Format = true;

// Initialize
window.addEventListener('load', () => {
    loadTimezones();
    updateClocks();
    setInterval(updateClocks, 1000);
});

// Event Listeners
searchBtn.addEventListener('click', handleAddTimezone);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddTimezone();
});

searchInput.addEventListener('input', handleSearch);

format24Btn.addEventListener('click', () => {
    is24Format = true;
    format24Btn.classList.add('active');
    format12Btn.classList.remove('active');
    updateClocks();
});

format12Btn.addEventListener('click', () => {
    is24Format = false;
    format24Btn.classList.remove('active');
    format12Btn.classList.add('active');
    updateClocks();
});

resetBtn.addEventListener('click', () => {
    activeTimezones = [...DEFAULT_TIMEZONES];
    saveTimezones();
    suggestionsDiv.style.display = 'none';
    searchInput.value = '';
    renderClocks();
});

// Load timezones from localStorage
function loadTimezones() {
    const saved = localStorage.getItem('activeTimezones');
    if (saved) {
        activeTimezones = JSON.parse(saved);
    }
}

// Save timezones to localStorage
function saveTimezones() {
    localStorage.setItem('activeTimezones', JSON.stringify(activeTimezones));
}

// Handle timezone search
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matches = ALL_TIMEZONES.filter(tz => 
        tz.toLowerCase().includes(query) && !activeTimezones.includes(tz)
    ).slice(0, 8);

    if (matches.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const html = matches.map(tz => 
        `<div class="suggestion-item" onclick="addTimezone('${tz}')"><i class="fas fa-clock"></i> ${tz}</div>`
    ).join('');

    suggestionsDiv.innerHTML = html;
    suggestionsDiv.style.display = 'grid';
}

// Add timezone
function handleAddTimezone() {
    const query = searchInput.value.trim().toUpperCase();
    
    if (!query) return;

    const timezone = ALL_TIMEZONES.find(tz => tz.toUpperCase() === query);
    
    if (timezone && !activeTimezones.includes(timezone)) {
        addTimezone(timezone);
    }
}

function addTimezone(timezone) {
    if (!activeTimezones.includes(timezone)) {
        activeTimezones.push(timezone);
        saveTimezones();
        renderClocks();
    }
    searchInput.value = '';
    suggestionsDiv.style.display = 'none';
}

// Remove timezone
function removeTimezone(timezone) {
    activeTimezones = activeTimezones.filter(tz => tz !== timezone);
    saveTimezones();
    renderClocks();
}

// Render clock cards
function renderClocks() {
    if (activeTimezones.length === 0) {
        clocksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>No timezones selected. Add one to get started!</p>
            </div>
        `;
        return;
    }

    const html = activeTimezones.map((tz, index) => {
        const isPreset = DEFAULT_TIMEZONES.includes(tz);
        return `
            <div class="clock-card ${isPreset ? 'preset' : ''}" id="clock-${index}">
                <button class="remove-btn" onclick="removeTimezone('${tz}')"><i class="fas fa-times"></i></button>
                <div class="clock-header">
                    <div class="timezone-name">${formatTimezoneName(tz)}</div>
                    <div class="timezone-info">${tz}</div>
                    <div class="timezone-offset" id="offset-${index}"></div>
                </div>
                <div class="digital-time" id="time-${index}"></div>
                <div class="clock-face">
                    <div class="hand hour-hand" id="hour-${index}"></div>
                    <div class="hand minute-hand" id="minute-${index}"></div>
                    <div class="hand second-hand" id="second-${index}"></div>
                </div>
                <div class="additional-info">
                    <div class="info-row">
                        <span class="info-label">Date:</span>
                        <span class="info-value" id="date-${index}"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Day:</span>
                        <span class="info-value" id="day-${index}"></span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    clocksContainer.innerHTML = html;
    updateClocks();
}

// Update all clocks
function updateClocks() {
    activeTimezones.forEach((tz, index) => {
        updateClock(tz, index);
    });
}

// Update individual clock
function updateClock(timezone, index) {
    try {
        // Get current time in timezone
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const timezoneDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

        let hours = parseInt(parts.find(p => p.type === 'hour').value);
        const minutes = parseInt(parts.find(p => p.type === 'minute').value);
        const seconds = parseInt(parts.find(p => p.type === 'second').value);
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;

        // Update digital time
        let timeDisplay;
        if (is24Format) {
            timeDisplay = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            timeDisplay = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${period}`;
        }

        document.getElementById(`time-${index}`).textContent = timeDisplay;

        // Update date and day
        const dateObj = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const dayStr = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        document.getElementById(`date-${index}`).textContent = dateStr;
        document.getElementById(`day-${index}`).textContent = dayStr;

        // Update offset
        const offset = getTimezoneOffset(timezone);
        document.getElementById(`offset-${index}`).textContent = `UTC ${offset}`;

        // Update clock hands
        const hourDegrees = (hours % 12) * 30 + minutes * 0.5;
        const minuteDegrees = minutes * 6 + seconds * 0.1;
        const secondDegrees = seconds * 6;

        document.getElementById(`hour-${index}`).style.transform = `rotate(${hourDegrees}deg)`;
        document.getElementById(`minute-${index}`).style.transform = `rotate(${minuteDegrees}deg)`;
        document.getElementById(`second-${index}`).style.transform = `rotate(${secondDegrees}deg)`;
    } catch (error) {
        console.error(`Error updating clock for ${timezone}:`, error);
    }
}

// Get timezone offset
function getTimezoneOffset(timezone) {
    const now = new Date();
    const tzString = now.toLocaleString('en-US', { timeZone: timezone });
    const tzDate = new Date(tzString);
    const offset = now.getTime() - tzDate.getTime();
    const hours = Math.floor(offset / 3600000);
    const minutes = Math.floor((offset % 3600000) / 60000);

    const sign = hours >= 0 ? '+' : '-';
    const absHours = Math.abs(hours);
    const absMinutes = Math.abs(minutes);

    return `${sign}${String(absHours).padStart(2, '0')}:${String(absMinutes).padStart(2, '0')}`;
}

// Format timezone name (convert Africa/Johannesburg to South Africa)
function formatTimezoneName(timezone) {
    const parts = timezone.split('/');
    if (parts.length > 1) {
        return parts[1].replace(/_/g, ' ');
    }
    return timezone;
}

// Initial render
renderClocks();
