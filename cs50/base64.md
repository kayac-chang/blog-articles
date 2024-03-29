# 什麼是 Base64

Base64 是一種編碼方式，可以將任意的資料轉換成只包含 64 個 ASCII 字元的字串。
這種編碼方式常用於將二進位資料傳送到不支援二進位的系統，例如電子郵件。

Base64 編碼的字串會比原本的資料長出 1/3，因為每 3 個字元會被轉換成 4 個字元。Base64 編碼的字串會以 `=` 結尾，用來表示原本的資料長度不是 3 的倍數。

:::tip
Base64 編碼的字串只包含 ASCII 字元，因此可以在任何地方傳送，例如電子郵件、網址、XML 檔案等等。
:::

> 什麼是編碼方式
> 編碼方式就是一種將資料轉換成另一種格式的方法。例如，我們可以將 ASCII 編碼轉換成二進位編碼，或是將二進位編碼轉換成 Base64 編碼。
