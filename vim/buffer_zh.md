# 淺談 Vim Buffer

## What is Vim Buffer

> Buffer 就是存在記憶體中的文字檔案

Vim 的做法與一般編輯器最大的不同，
即在於 Vim 對於寫入檔案的保護。

當每次我們用 Vim 開啟檔案時，
Vim 會為我們配置 Buffer，
而當前畫面顯示的內容即是 Buffer，
而非檔案本身。

我們做的所有異動都是對於這個 Buffer，
只有當我們要寫入檔案時，
才會將 Buffer 的內容寫進 Disk，
這也是為什麼 Vim 是用 `write (:w)` 而非 `save`，
來描述儲存這件事。

Vim 允許我們同時編輯多個 Buffer，
尤其在大專案編寫的過程中，控制 Buffer 的技術尤其重要。

以下將 Buffer 的操作類型拆做 4 大類：

- Create
- List
- Navigation
- Delete

並依以上順序介紹。

## How to Create Vim Buffer - Create

以下 command 會建立新的 Buffer

1. 開啟新的水平分頁

```
:new
```

2. 開啟新的垂直分頁

```
:vnew
```

3. 開啟檔案

```
:edit file-name
```

或是縮寫

```
:e file-name
```

預設配置下，
如果同時編輯多個 Buffer 但再切換 Buffer 時忘記存擋，
Vim 會跳出錯誤訊息，
以下設定可以關閉該項防呆訊息。

```
:set hidden
```

## How to manage Vim Buffer - List

以下 command 可以列出所有當前的 Buffer

```
:buffers
```

或是比較短的

```
:ls
```

Vim 會透過表單的呈現方式，
顯示當前 Buffer 的編號以及他的狀態。

```
  1 %a   "data.csv"                     line 1
```

- `1`
  前面 `1` 是 buffer number，
  每個 Buffer 會有自己的編號
- `%a`
  此處有兩個訊息，
  `%` 表示當前正在 Focus 的 Buffer
  `a` 表示這個 Buffer 正在開啟，且在正在畫面上
- `line 1`
  是指 Buffer 當前的 cursor 位置。

接著我們試試開始多個檔案

```
:e code.rb
:e schema.sql
```

此時的 List 呈現應該會變成

```
  1  h   "data.csv"                     line 1
  2 #h   "code.rb"                      line 1
  3 %a   "schema.sql"                   line 1
```

- `h`
  `h` 是指這個 Buffer 現在正在隱藏，並未在畫面上
- `#`
  `#` 是指上一個關掉的 Buffer

讓我們對當前檔案做一些編輯動作

`schema.sql`

```
select 1;
```

此時的 List 應該會變成

```
  1  h   "data.csv"                     line 1
  2 #h   "code.rb"                      line 1
  3 %a + "schema.sql"                   line 1
```

- `+`
  這告訴我們這個 Buffer 被編輯但還沒儲存。

## How to Navigation with Buffer

如果你想要切換當前正在操作的 Buffer，
可透過以下 command

```
:buffer number
```

其縮寫

```
:b number
```

如果想要一次性開啟全部在 List 中的 Buffer

```
:ball
```

或是橫向的

```
:vertical ball
```

你可以透過 `<C-w><C-w>` (aka Ctrl + w 兩次)，
快速切換正在開啟的分頁。

你也可以透過編號下去切換 Buffer
例如 切到下一號

```
:bnext
```

or

```
:bn
```

上一號

```
:bprevious
```

or

```
:bp
```

或是跳到第一個

```
:bfirst
```

或是最後一個

```
:blast
```

## How to delete buffer

```
:bdelete arg
```

或是

```
:bd arg
```

arg 可以是 檔案名 或是 buffer number。

你可以一次性刪除多個 Buffer

```
:bd name1 name2
```

也可以透過編號，例如以下可以刪除 2 ~ 4 編號的 Buffer

```
:2,4bd
```

## In Summary

以上，我們討論了 Vim Buffer 的四大型
Create，List，Navigation，Delete。

Buffer 操作在使用 Vim 開發專案時幾乎少不了，
透過熟練以上指令，
讓你的 Vim 功力獲得大幅提升吧。
