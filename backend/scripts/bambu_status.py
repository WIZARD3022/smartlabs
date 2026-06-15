import json
import os
import sys
import time

import bambulabs_api as bl


def main():
    ip_address = os.environ.get("BAMBU_IP")
    serial_number = os.environ.get("BAMBU_SERIAL")
    access_code = os.environ.get("BAMBU_ACCESS_CODE")

    if not all([ip_address, serial_number, access_code]):
        raise RuntimeError("Bambu IP, serial number, and access code are required")

    printer = bl.Printer(ip_address, access_code, serial_number)
    printer.connect()
    time.sleep(2)
    state = printer.get_state()
    printer.disconnect()
    print(json.dumps({"state": state}, default=str))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
