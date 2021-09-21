import subprocess as sb
import os

if __name__ == "__main__":
    server = sb.Popen(["python", "-m", "metaworkspace", "--run", "test"], stderr=sb.STDOUT)
    os.chdir("metaworkspace-react")
    client = sb.Popen(["npm", "start"], stderr=sb.STDOUT)
    print("Both workers are running...")
    server.wait()
    client.wait()


