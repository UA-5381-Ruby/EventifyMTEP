namespace :test do
  desc "Run all tests (Minitest and RSpec) with combined coverage"
  task :all do
    puts "Running Minitest..."
    system("bundle exec rake test")

    puts "Running RSpec..."
    system("bundle exec rspec")
  end
end