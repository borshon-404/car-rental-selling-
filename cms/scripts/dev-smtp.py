"""Local SMTP sink. Stays up and appends each DATA body to /tmp/smtp-captured.txt."""
import socket

sock = socket.socket()
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock.bind(("127.0.0.1", 1025))
sock.listen(5)
print("smtp-ready", flush=True)
while True:
    conn, _ = sock.accept()
    try:
        conn.sendall(b"220 localhost ESMTP\r\n")
        buf = b""
        body = b""
        in_data = False
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break
            buf += chunk
            while b"\r\n" in buf:
                line, buf = buf.split(b"\r\n", 1)
                if in_data:
                    body += line + b"\r\n"
                    if line == b".":
                        with open("/tmp/smtp-captured.txt", "ab") as handle:
                            handle.write(body + b"\n---\n")
                        print("captured", len(body), flush=True)
                        conn.sendall(b"250 queued\r\n")
                        in_data = False
                        body = b""
                    continue
                upper = line.upper()
                if upper.startswith(b"DATA"):
                    conn.sendall(b"354 go\r\n")
                    in_data = True
                elif upper.startswith(b"QUIT"):
                    conn.sendall(b"221 bye\r\n")
                    break
                else:
                    conn.sendall(b"250 ok\r\n")
    finally:
        conn.close()
