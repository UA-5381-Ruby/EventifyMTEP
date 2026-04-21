require 'test_helper'

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.new(name: 'Test User', email: 'test@example.com', password: 'password123')
  end

  test 'should be valid with all correct attributes' do
    assert @user.valid?
  end

  test 'name should be present' do
    @user.name = '   '
    assert_not @user.valid?, 'User is valid without a name'
  end

  test 'email should be present' do
    @user.email = '   '
    assert_not @user.valid?, 'User is valid without an email'
  end

  test 'email should be unique' do
    duplicate_user = @user.dup
    @user.save
    assert_not duplicate_user.valid?, 'User is valid with a duplicate email'
  end

  test 'email format should be valid' do
    invalid_emails = ['test@com', 'invalid_email', 'test.com', '@test.com']
    invalid_emails.each do |invalid_email|
      @user.email = invalid_email
      assert_not @user.valid?, "#{invalid_email} should be invalid"
    end
  end

  test 'password should be present' do
    @user.password = @user.password_confirmation = ' ' * 6
    assert_not @user.valid?, 'User is valid without a password'
  end
end
