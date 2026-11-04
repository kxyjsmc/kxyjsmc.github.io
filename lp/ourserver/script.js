const menuButton = document.querySelector('.menu');
const nav = document.querySelector('.main-nav');
const refreshButton = document.getElementById('refresh-status-btn');

if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
        nav.classList.toggle('open');
        menuButton.classList.toggle('active');
    });
}

const PLAYER_LIST_STORAGE_KEY = 'kxmc-server-player-history';

function setRefreshButtonState(isLoading) {
    if (!refreshButton) {
        return;
    }

    refreshButton.disabled = isLoading;
    refreshButton.classList.toggle('refreshing', isLoading);
    refreshButton.textContent = isLoading ? '刷新中...' : '↻ 刷新';
}

function getPlayerAvatarUrl(username) {
    return `https://mineskin.eu/helm/${encodeURIComponent(username)}`;
}

function updateOnlinePlayerList(players = []) {
    const listEl = document.getElementById('online-player-list');
    const badgeEl = document.getElementById('player-count-badge');

    if (!listEl || !badgeEl) {
        return;
    }

    badgeEl.textContent = `${players.length} 人在线`;

    if (!players.length) {
        listEl.innerHTML = '<li class="empty">暂无在线玩家</li>';
        return;
    }

    listEl.innerHTML = players
        .map((player) => `
            <li class="player-pill">
                <img class="player-head" src="${getPlayerAvatarUrl(player)}" alt="${player} 头像" loading="lazy">
                <span>${player}</span>
            </li>
        `)
        .join('');
}

async function loadServerStatus() {
    const serverAddress = 'zjd.rainplay.cn:26732';
    const statusBadge = document.getElementById('server-status-badge');
    const playersEl = document.getElementById('server-players');
    const versionEl = document.getElementById('server-version');
    const latencyEl = document.getElementById('server-latency');
    const trendEl = document.getElementById('server-trend');
    const addressEl = document.getElementById('server-address');

    if (!statusBadge || !playersEl || !versionEl || !latencyEl || !trendEl || !addressEl) {
        return;
    }

    addressEl.textContent = serverAddress;
    setRefreshButtonState(true);

    try {
        const start = performance.now();
        const response = await fetch(`https://api.mcsrvstat.us/2/${encodeURIComponent(serverAddress)}`, {
            cache: 'no-store'
        });
        const latency = Math.max(0, Math.round(performance.now() - start));

        if (!response.ok) {
            throw new Error('Request failed');
        }

        const data = await response.json();
        const online = Boolean(data.online);
        const onlinePlayers = data.players?.online ?? 0;
        const maxPlayers = data.players?.max ?? 0;
        const version = data.version || '未知';
        const playerNames = Array.isArray(data.players?.list) ? data.players.list : [];

        statusBadge.textContent = online ? '在线' : '离线';
        statusBadge.classList.toggle('online', online);
        statusBadge.classList.toggle('offline', !online);
        playersEl.textContent = `${onlinePlayers} / ${maxPlayers}`;
        versionEl.textContent = version;
        latencyEl.textContent = `${latency} ms`;

        updateOnlinePlayerList(playerNames);

        const trendStorageKey = 'kxmc-server-trend';
        const history = JSON.parse(localStorage.getItem(trendStorageKey) || '[]');
        history.push({ time: Date.now(), players: onlinePlayers });

        while (history.length > 8) {
            history.shift();
        }

        localStorage.setItem(trendStorageKey, JSON.stringify(history));

        let trendText = '稳定';
        let trendClass = 'trend-stable';

        if (history.length >= 2) {
            const current = history[history.length - 1].players;
            const previous = history[history.length - 2].players;
            const delta = current - previous;

            if (delta > 0) {
                trendText = `↑ +${delta} 人`;
                trendClass = 'trend-up';
            } else if (delta < 0) {
                trendText = `↓ ${Math.abs(delta)} 人`;
                trendClass = 'trend-down';
            } else {
                trendText = '稳定';
                trendClass = 'trend-stable';
            }
        }

        trendEl.textContent = trendText;
        trendEl.classList.remove('trend-up', 'trend-down', 'trend-stable');
        trendEl.classList.add(trendClass);
    } catch (error) {
        statusBadge.textContent = '离线';
        statusBadge.classList.add('offline');
        statusBadge.classList.remove('online');
        playersEl.textContent = '0 / 0';
        versionEl.textContent = '未知';
        latencyEl.textContent = '超时';
        trendEl.textContent = '未统计';
        trendEl.classList.remove('trend-up', 'trend-down', 'trend-stable');
        trendEl.classList.add('trend-stable');
        updateOnlinePlayerList([]);
    } finally {
        setRefreshButtonState(false);
    }
}

if (refreshButton) {
    refreshButton.addEventListener('click', () => {
        loadServerStatus();
    });
}

loadServerStatus();
setInterval(loadServerStatus, 30000);
