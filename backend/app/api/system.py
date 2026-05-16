from fastapi import APIRouter
import platform
import psutil
from datetime import datetime

router = APIRouter()


@router.get("")
async def get_system_info():
    cpu_freq = psutil.cpu_freq()
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    boot_time = datetime.fromtimestamp(psutil.boot_time())
    uptime = str(datetime.now() - boot_time).split('.')[0]

    try:
        import torch
        gpu_available = torch.cuda.is_available()
        gpu_info = []
        if gpu_available:
            for i in range(torch.cuda.device_count()):
                gpu_info.append({
                    "name": torch.cuda.get_device_name(i),
                    "memory_total": torch.cuda.get_device_properties(i).total_memory / (1024**3),
                })
    except:
        gpu_available = False
        gpu_info = []

    net_if = psutil.net_if_addrs()
    network_interfaces = []
    for iface, addrs in net_if.items():
        for addr in addrs:
            if str(addr.family) == 'AddressFamily.AF_INET':
                network_interfaces.append({
                    "name": iface,
                    "ip": addr.address,
                    "netmask": addr.netmask
                })

    services = []
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
            try:
                if proc.info['cpu_percent'] and proc.info['cpu_percent'] > 0.1:
                    services.append({
                        "pid": proc.info['pid'],
                        "name": proc.info['name'],
                        "cpu": round(proc.info['cpu_percent'], 2)
                    })
            except:
                pass
    except:
        pass

    return {
        "os": {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor()
        },
        "hostname": platform.node(),
        "uptime": uptime,
        "cpu": {
            "physical_cores": psutil.cpu_count(logical=False),
            "logical_cores": psutil.cpu_count(logical=True),
            "max_frequency": f"{cpu_freq.max:.2f} MHz" if cpu_freq else "N/A",
            "current_frequency": f"{cpu_freq.current:.2f} MHz" if cpu_freq else "N/A"
        },
        "memory": {
            "total": round(mem.total / (1024**3), 2),
            "available": round(mem.available / (1024**3), 2),
            "used": round(mem.used / (1024**3), 2),
            "percent": mem.percent
        },
        "disk": {
            "total": round(disk.total / (1024**3), 2),
            "used": round(disk.used / (1024**3), 2),
            "free": round(disk.free / (1024**3), 2),
            "percent": disk.percent
        },
        "gpu": gpu_info if gpu_info else [{"name": "No GPU detected", "memory_total": 0}],
        "network": network_interfaces,
        "top_processes": sorted(services, key=lambda x: x['cpu'], reverse=True)[:10]
    }