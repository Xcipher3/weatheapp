import os
import platform
import subprocess

def clear_screen():
    """Clear the terminal screen based on the operating system"""
    if platform.system() == "Windows":
        os.system("cls")
    else:
        os.system("clear")

def check_dependencies():
    """Check if all required dependencies are installed"""
    required_packages = ["fastapi", "upstash_redis", "uvicorn", "requests", "python-dotenv"]
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages

def main():
    """Main function to start the preview server"""
    clear_screen()
    
    print("🌦️  Weather App Preview Launcher 🌦️")
    print("====================================")
    
    # Check dependencies
    missing_packages = check_dependencies()
    if missing_packages:
        print("\n❌ Missing dependencies detected!")
        print("Please install the following packages:")
        for package in missing_packages:
            print(f"  - {package}")
        print("\nRun the following command to install all dependencies:")
        print("pip install fastapi upstash-redis uvicorn[standard] requests python-dotenv")
        return
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("\n❌ .env file not found!")
        print("Please create a .env file with your API credentials.")
        return
    
    # Start the preview server
    print("\n✅ All dependencies found!")
    print("✅ .env file found!")
    print("\n🚀 Starting the preview server...")
    print("\n📱 Open your browser and navigate to: http://localhost:8000")
    print("\n⚠️  Press Ctrl+C to stop the server")
    
    try:
        subprocess.run(["python", "preview_server.py"])
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped!")
        print("Thank you for using the Weather App Preview!")

if __name__ == "__main__":
    main()
