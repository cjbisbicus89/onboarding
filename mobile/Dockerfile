FROM reactnativecommunity/react-native-android:latest

ENV CI=true
WORKDIR /app/mobile

COPY mobile/package*.json ./
RUN npm ci

COPY shared /app/shared
COPY mobile .

RUN cd android && chmod +x ./gradlew && ./gradlew assembleDebug

RUN cp android/app/build/outputs/apk/debug/app-debug.apk /app/mobile/app-mobile.apk

CMD ["sh", "-c", "mkdir -p /out && cp /app/mobile/app-mobile.apk /out/app-mobile.apk"]
