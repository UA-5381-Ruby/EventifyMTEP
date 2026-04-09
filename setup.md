                                                    Development Environment Setup Guide

This guide ensures we all share a consistent development environment. By following these steps, we minimize "this works on my machine" bugs.
1. System Update & Basic Dependencies

Before we begin, let's update our system's package index and install basic networking and version control tools.
Bash

# Update package indexes
sudo apt update

# Install necessary utilities for subsequent steps
sudo apt install -y git ca-certificates curl

2. Ruby & Ruby on Rails Setup

We need the Rails framework and Ruby build tools for our project.
Bash

# Clone ruby-build (an rbenv plugin that provides a command to compile and install different versions of Ruby)
git clone https://github.com/rbenv/ruby-build.git

# Install Rails version 8.0.0 globally
# Note: using sudo for gem install might be required by your current environment setup, 
# but it is generally recommended to use version managers (rbenv/rvm) without sudo.
sudo gem install rails --version 8.0.0 

3. PostgreSQL Setup

If there are old or conflicting Postgres repositories on your system, it's best to remove them before doing a clean installation.
Bash

# Check if there are third-party PostgreSQL repositories in the system
grep -R "apt.postgresql.org" /etc/apt/sources.list /etc/apt/sources.list.d/

# Remove the old PGDG repository list to avoid conflicts
sudo rm -f /etc/apt/sources.list.d/pgdg.list

# Update the package list after removing the repository
sudo apt update

# Install PostgreSQL from the official Ubuntu repositories
sudo apt install -y postgresql

4. Docker Setup

Next, we install Docker to run containerized services (like databases). First, we remove any old versions, then install the latest ones from Docker's official repository.
Bash

# Remove all possible old Docker packages to avoid conflicts
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do 
  sudo apt-get remove -y $pkg
done

# Prepare the directory for GPG keys
sudo install -m 0755 -d /etc/apt/keyrings

# Download Docker's official GPG key
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the Docker repository to apt sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update the system with the new repository
sudo apt-get update

# Install Docker Engine, CLI, Containerd, and required plugins
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add the current user to the docker group to run Docker without sudo
sudo usermod -aG docker $USER

# Apply group permissions without needing to log out and log back in
newgrp docker

5. MongoDB Database Setup via Docker

Now that Docker is installed, we can spin up MongoDB.

    Note: If a container with this name already exists, remove it first using docker stop mongo-logs and docker rm mongo-logs.

Bash

# Run a MongoDB container in the background (detached mode)
# Container name: mongo-logs, mapped to port 27017
docker run --name mongo-logs -p 27017:27017 -d mongo

# Check the status of running containers
docker ps -a

Developer Reference: Handy commands for managing this container:

    Stop: docker stop mongo-logs

    Start again: docker start mongo-logs

    Remove: docker rm mongo-logs (container must be stopped first)

6. RuboCop Linter Setup

We use RuboCop to maintain a consistent code style across the project.

Run these commands in the root directory of your project:
Bash

# Download the standard RuboCop config file from the official repository
curl -o .rubocop.yml https://raw.githubusercontent.com/rubocop/rubocop/refs/heads/master/.rubocop.yml

# Install the RuboCop gem
gem install rubocop

# Initialize Bundler (this creates a Gemfile if you don't have one yet)
bundle init

With the config file in place and dependencies installed, run the following command from your project root to check your code:
Bash

# Run the linter
bundle exec rubocop
7. Additional Static Analysis (ruby-lint)

While RuboCop handles our code formatting and style guidelines, we also use ruby-lint for deeper static code analysis. It focuses specifically on finding logical errors (such as undefined methods or missing variables) rather than styling issues.
Bash

# Install the ruby-lint gem globally
gem install ruby-lint

# To analyze a specific file or directory, run:
ruby-lint path/to/your/file.rb
# Сlone our repository
git clone https://github.com/UA-5381-Ruby/EventifyMTEP.gitІ
8. Visual Studio Code (VS Code) Setup

# To ensure a smooth and consistent development experience, we highly recommend using VS Code with a standardized set of extensions and workspace settings. This will enable syntax highlighting, code navigation, and automatic linting.

git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'eval "$(~/.rbenv/bin/rbenv init - bash)"' >> ~/.bashrc
rbenv install 3.3.0
rbenv global 3.3.0
gem install rails --version 8.0.0
gem install ruby-lsp rubocop
Please install the following extensions from the VS Code Marketplace:

    Ruby LSP (by Shopify) - Provides the official language server features for Ruby (autocomplete, go-to-definition, etc.).

    Rubocop (by Loris Cro or standard extension) - Integrates RuboCop directly into the editor for inline feedback.

    Docker (by Microsoft) - Makes it easier to manage our MongoDB and other containers.

Workspace Settings

    To automate formatting and keep our code style consistent without manual effort, create a .vscode/settings.json file in the root directory of the project (if it doesn't already exist) and add the following configuration:
JSON

{
  "editor.formatOnSave": true,
  "[ruby]": {
    "editor.defaultFormatter": "Shopify.ruby-lsp",
    "editor.formatOnSave": true
  },
  "rubyLsp.formatter": "rubocop",
  "rubyLsp.rubyVersionManager": "rbenv"
}

This configuration ensures that every time you save a Ruby file, RuboCop will automatically format it according to our .rubocop.yml rules, and the editor will correctly use rbenv to find our Ruby version.
Windows
his guide will help you set up a Ruby on Rails environment directly on Windows, without using virtual machines or WSL.
1. Ruby & Build Tools (DevKit) Installation

Since Windows doesn't have built-in compilers (like gcc in Linux), we need a special package that installs both Ruby and the MSYS2 environment, which is required for compiling gems with native extensions.

    Go to the RubyInstaller for Windows website.

    Download the Ruby+Devkit version (e.g., Ruby+Devkit 3.3.x (x64)).

    Run the installer. During installation, make sure to keep the "ridk install" checkbox checked (this installs MSYS2).

    After the installation is complete, a black terminal window will open. Press Enter (or type 3 and press Enter) to install the base MSYS2 toolchain (MSYS2 base installation + MSYS2 system update + MSYS2 and MINGW development toolchain).

To check if everything works, open PowerShell and type:
PowerShell

ruby -v

2. Git & Node.js Installation

    Download and install Git for Windows. You can leave all settings at their defaults during installation.

    (Optional, but recommended for frontend assets) Download and install the LTS version of Node.js.

3. Database Setup

Since we are working natively, it's best to install databases using their official Windows installers.
PostgreSQL

    Download the PostgreSQL installer for Windows.

    Run it. During installation, the system will ask you to create a password for the postgres superuser — make sure to remember it, as you will need it for the Rails configuration (database.yml).

MongoDB

Since we originally ran MongoDB via Docker in our main guide, you have two options here:

    Option A (Recommended): Install Docker Desktop for Windows and run the exact same command in PowerShell:
    PowerShell

    docker run --name mongo-logs -p 27017:27017 -d mongo

    Option B (Completely Docker-free): Download the MongoDB Community Server installer for Windows and install it like a regular application.

4. Installing Rails & Linters

Open PowerShell and run the following commands to install Rails, RuboCop, and the language servers for VS Code. (In Windows, we do not need sudo to install gems).
PowerShell

gem install rails --version 8.0.0
gem install rubocop ruby-lsp ruby-lint

Note: If you encounter errors with red text during gem installation (especially those interacting with the database, like pg), it usually means MSYS2 cannot find the paths to your installed PostgreSQL. This is one of the main reasons developers often prefer WSL.
5. VS Code Setup

    Install Visual Studio Code.

    Add the Ruby LSP and Rubocop extensions.

    In your project, create or edit the .vscode/settings.json file.

Important difference from Linux: Since we are not using version managers like rbenv or rvm on Windows (Ruby is installed globally via RubyInstaller), we need to disable that option for the LSP.
JSON

{
  "editor.formatOnSave": true,
  "[ruby]": {
    "editor.defaultFormatter": "Shopify.ruby-lsp",
    "editor.formatOnSave": true
  },
  "rubyLsp.formatter": "rubocop",
  "rubyLsp.rubyVersionManager": "none" 
}

Troubleshooting Tip for Windows

If the Ruby LSP extension in VS Code complains that it can't find bundle or other commands, ensure that the path to your Ruby bin folder is added to your System Environment Variables (Path). RubyInstaller usually does this automatically.