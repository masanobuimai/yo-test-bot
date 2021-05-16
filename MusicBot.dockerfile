FROM adoptopenjdk:11-jdk

WORKDIR /musicbot

RUN curl -OL https://github.com/jagrosh/MusicBot/releases/download/0.3.4/JMusicBot-0.3.4.jar

COPY config.musicbot.txt config.txt

CMD [ "java", "-Dnogui=true", "-jar", "JMusicBot-0.3.4.jar" ]