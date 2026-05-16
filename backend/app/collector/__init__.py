import os
import time
import threading
from datetime import datetime
from pathlib import Path
from loguru import logger
from app.database import SessionLocal
from app.models.log import LogEntry
import re

log_collector_config = {
    "enabled": False,
    "watch_directory": "",
    "file_patterns": ["*.log", "*.txt"],
    "poll_interval": 5,
    "processed_files": {},
}

collector_thread = None
collector_running = False


def parse_log_line(line: str) -> dict:
    patterns = [
        r'\[(?P<timestamp>[\d\-:T\s.]+)\]\s*\[(?P<level>\w+)\]\s*(?P<message>.*)',
        r'(?P<timestamp>[\d\-:T\s.]+)\s*-\s*(?P<level>\w+)\s*-\s*(?P<message>.*)',
        r'(?P<level>ERROR|WARN|WARNING|INFO|DEBUG|FATAL|CRITICAL):\s*(?P<message>.*)',
    ]

    for pattern in patterns:
        match = re.match(pattern, line.strip())
        if match:
            data = match.groupdict()
            if 'timestamp' not in data:
                data['timestamp'] = datetime.now().isoformat()
            if 'level' not in data:
                data['level'] = 'INFO'
            return data

    return {
        'timestamp': datetime.now().isoformat(),
        'level': 'INFO',
        'message': line.strip()
    }


def process_log_file(filepath: str, source_name: str):
    try:
        db = SessionLocal()
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                file_size = os.path.getsize(filepath)

                if source_name in log_collector_config["processed_files"]:
                    last_pos = log_collector_config["processed_files"].get(source_name, 0)
                    if last_pos >= file_size:
                        return
                    f.seek(last_pos)
                else:
                    log_collector_config["processed_files"][source_name] = 0

                new_entries = 0
                for line in f:
                    if line.strip():
                        parsed = parse_log_line(line)
                        log_entry = LogEntry(
                            timestamp=datetime.fromisoformat(parsed['timestamp']) if 'timestamp' in parsed else datetime.now(),
                            level=parsed.get('level', 'INFO').upper(),
                            source=source_name,
                            message=parsed.get('message', line),
                            raw_content=line.strip()
                        )
                        db.add(log_entry)
                        new_entries += 1

                if new_entries > 0:
                    db.commit()
                    log_collector_config["processed_files"][source_name] = file_size
                    logger.info(f"Collected {new_entries} new log entries from {source_name}")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error processing log file {filepath}: {e}")


def scan_directory():
    if not log_collector_config["enabled"]:
        return

    watch_dir = log_collector_config["watch_directory"]
    if not watch_dir or not os.path.exists(watch_dir):
        return

    patterns = log_collector_config["file_patterns"]

    for pattern in patterns:
        pattern_path = os.path.join(watch_dir, pattern)
        for filepath in Path(watch_dir).glob(pattern):
            if filepath.is_file():
                process_log_file(str(filepath), filepath.name)


def collector_worker():
    logger.info("Log collector started")
    while collector_running:
        try:
            scan_directory()
        except Exception as e:
            logger.error(f"Error in collector: {e}")
        time.sleep(log_collector_config["poll_interval"])
    logger.info("Log collector stopped")


def start_collector():
    global collector_thread, collector_running

    if collector_thread and collector_thread.is_alive():
        logger.warning("Collector already running")
        return

    collector_running = True
    collector_thread = threading.Thread(target=collector_worker, daemon=True)
    collector_thread.start()
    logger.info("Log collector thread started")


def stop_collector():
    global collector_running
    collector_running = False


def configure_collector(enabled: bool = None, watch_directory: str = None, poll_interval: int = None):
    global log_collector_config

    if enabled is not None:
        log_collector_config["enabled"] = enabled
    if watch_directory is not None:
        log_collector_config["watch_directory"] = watch_directory
    if poll_interval is not None:
        log_collector_config["poll_interval"] = poll_interval

    logger.info(f"Collector config updated: {log_collector_config}")
    return log_collector_config


def get_collector_status():
    return {
        "enabled": log_collector_config["enabled"],
        "watch_directory": log_collector_config["watch_directory"],
        "poll_interval": log_collector_config["poll_interval"],
        "running": collector_thread.is_alive() if collector_thread else False,
        "files_tracked": len(log_collector_config["processed_files"]),
    }