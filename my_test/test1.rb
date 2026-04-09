class Person
  def initialize(name)
    # oops, not setting @name
  end

  def greet
    "Hello, #{@name}"
  end
end

user = Person.new('Alice')
user.greet

user.greet(:foo)
