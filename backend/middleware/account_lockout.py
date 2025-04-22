import time
from collections import defaultdict
from threading import Lock

FAILED_LIMIT = 5  # max failed login attempts
LOCKOUT_PERIOD = 300  # lockout for 5 minutes
RATE_PERIOD = 60  # window for failed attempts

failed_login_store = defaultdict(list)  # {username: [timestamps]}
account_lockout_store = {}  # {username: lockout_until}
lock = Lock()


def is_account_locked(username: str):
    until = account_lockout_store.get(username)
    if until and until > time.time():
        return True, until
    if until and until <= time.time():
        del account_lockout_store[username]
    return False, None


def record_failed_login(username: str):
    now = time.time()
    with lock:
        timestamps = failed_login_store[username]
        failed_login_store[username] = [t for t in timestamps if now - t < RATE_PERIOD]
        failed_login_store[username].append(now)
        if len(failed_login_store[username]) >= FAILED_LIMIT:
            account_lockout_store[username] = now + LOCKOUT_PERIOD
            failed_login_store[username] = []


def reset_failed_logins(username: str):
    with lock:
        failed_login_store[username] = []
