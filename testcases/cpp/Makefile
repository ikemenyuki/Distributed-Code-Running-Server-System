CC = g++
CFLAGS = -std=c++11

SRCS = main.cpp functions.cpp
OBJS = $(SRCS:.cpp=.o)
TARGET = example

all: $(TARGET) run

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.cpp
	$(CC) $(CFLAGS) -c $< -o $@

run:
	./$(TARGET)

clean:
	rm -f $(OBJS) $(TARGET)
