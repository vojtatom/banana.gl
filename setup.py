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
    version="0.0.2",
    description="Python tool simplyfing work with Metacity Modules",
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
    python_requires='>=3.8',                # Minimum version requirement of the package
    install_requires=[
        "metacity>=0.0.11",
        "requests>=2.26.0"
    ] # Install other dependencies if any
)