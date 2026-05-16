import psutil
from app.database import SessionLocal
from app.models.alert import Alert
from datetime import datetime


class ThresholdMonitor:
    def __init__(self, cpu_threshold=80, ram_threshold=80, disk_threshold=90):
        self.cpu_threshold = cpu_threshold
        self.ram_threshold = ram_threshold
        self.disk_threshold = disk_threshold

    def check_thresholds(self):
        cpu = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage('/').percent

        alerts_created = []

        if cpu > self.cpu_threshold:
            alerts_created.append(self._create_alert(
                "High CPU Usage",
                f"CPU usage is at {cpu:.1f}%, exceeding threshold of {self.cpu_threshold}%",
                "warning" if cpu < 90 else "critical",
                "cpu",
                cpu,
                self.cpu_threshold
            ))

        if memory > self.ram_threshold:
            alerts_created.append(self._create_alert(
                "High Memory Usage",
                f"Memory usage is at {memory:.1f}%, exceeding threshold of {self.ram_threshold}%",
                "warning" if memory < 90 else "critical",
                "memory",
                memory,
                self.ram_threshold
            ))

        if disk > self.disk_threshold:
            alerts_created.append(self._create_alert(
                "High Disk Usage",
                f"Disk usage is at {disk:.1f}%, exceeding threshold of {self.disk_threshold}%",
                "warning" if disk < 95 else "critical",
                "disk",
                disk,
                self.disk_threshold
            ))

        return alerts_created

    def _create_alert(self, title, message, severity, metric_name, metric_value, threshold):
        db = SessionLocal()
        existing = db.query(Alert).filter(
            Alert.metric_name == metric_name,
            Alert.is_active == True
        ).first()

        if existing:
            db.close()
            return None

        alert = Alert(
            timestamp=datetime.now(),
            severity=severity,
            title=title,
            message=message,
            metric_name=metric_name,
            metric_value=metric_value,
            threshold=threshold,
            is_active=True
        )
        db.add(alert)
        db.commit()
        db.close()
        return alert


monitor = ThresholdMonitor()