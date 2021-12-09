import pathlib
from setuptools import setup, find_packages

# The directory containing this file
HERE = pathlib.Path(__file__).parent

# The text of the README file
README = (HERE / "README.md").read_text()

# This call to setup() does all the work
setup(
    name="metaworkspace",
    packages=find_packages("."),
    version="0.3.0",
    description="Python-React application for visualization of urban data",
    long_description=README,
    long_description_content_type="text/markdown",
    url="https://github.com/MetacitySuite/Metacity-Workspace",
    author="Metacity",
    license="MIT",
    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
    ],
    python_requires='>=3.8', # Minimum version requirement of the package
    install_requires=[
        "metacity>=0.2.5",
        "requests>=2.26.0",
        "twine>=3.4.2",
        "fastapi>=0.68.1",
        "uvicorn>=0.15.0",
        "aiofiles>=0.7.0",
        "jinja2>=3.0.1",
        "watchdog>=2.1.5",
        "bcrypt>=3.2.0",
        "python-jose>=3.3.0",
        "python-jwt>=2.0.1",
        "passlib>=1.7.4",
        "python-multipart>=0.0.5"
    ],
    zip_safe=False,
    include_package_data=True
)
