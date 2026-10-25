# 程式模式（PRGM）

[← 內置公式](16-built-in-formulas.md) · [目錄](README.md) · [附錄 →](18-appendix.md)

> 原書頁碼：Ch-58–Ch-65。繁體中文；公式、鍵序及辨識不確定處保留原文影像。文字辨識限制見[轉換說明](README.md#轉換說明)。

本節內容：

- [程式模式概要（Ch-58）](#ch-58)
- [程式的創建（Ch-58）](#ch-58)
- [程式的運行（Ch-59）](#ch-59)
- [程式的刪除（Ch-60）](#ch-60)
- [指令的輸入（Ch-60）](#ch-60)
- [指令參考（Ch-60）](#ch-60)

<a id="ch-58"></a>

## Ch-58

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0307.png)

您可以用 PRGM <img src="assets/excerpts/17-programming-ch-58-symbol-0916.png" alt="原文符號或待核對字" height="22"> ( <img src="assets/excerpts/17-programming-ch-58-symbol-0917.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-58-symbol-0918.png" alt="原文符號或待核對字" height="22"> ) 將要進行的計算作成程式並保存起來。 程式中可以包含任

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0308.png)

### 程式模式概要

<img src="assets/excerpts/17-programming-ch-58-symbol-0920.png" alt="原文符號或待核對字" height="22"> 程式運行 <img src="assets/excerpts/17-programming-ch-58-symbol-0921.png" alt="原文符號或待核對字" height="22"> 的指定雖然程式在 PRGM 模式中創建及運行 <img src="assets/excerpts/17-programming-ch-58-symbol-0922.png" alt="原文符號或待核對字" height="22"> 但各程式都有一個 <img src="assets/excerpts/17-programming-ch-58-symbol-0923.png" alt="原文符號或待核對字" height="22"> 模式 ”, 程式在此模式中運

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0309.png)

需要考慮程式所做的計算並選擇相應的運行模式。

<img src="assets/excerpts/17-programming-ch-58-symbol-0925.png" alt="原文符號或待核對字" height="22"> 程式記憶器程式記憶器共有 680 位元組的容量， 可供四個程式共享。 程式記憶器存滿後便無法再保存其

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0310.png)

### 程式的創建

“ 新程式的 <img src="assets/excerpts/17-programming-ch-58-symbol-0926.png" alt="原文符號或待核對字" height="22"> 範例： 如何創建一個將英寸變換為 <img src="assets/excerpts/17-programming-ch-58-symbol-0927.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-58-symbol-0928.png" alt="原文符號或待核對字" height="22"> 的程式 <img src="assets/excerpts/17-programming-ch-58-symbol-0929.png" alt="原文符號或待核對字" height="22"> 英寸 <img src="assets/excerpts/17-programming-ch-58-symbol-0930.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-58-symbol-0931.png" alt="原文符號或待核對字" height="22">

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0311.png)

已含有程式資料的程式區 <img src="assets/excerpts/17-programming-ch-58-symbol-0932.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-58-symbol-0933.png" alt="原文符號或待核對字" height="22">

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0312.png)

<img src="assets/excerpts/17-programming-ch-58-symbol-0934.png" alt="原文符號或待核對字" height="22"> 1 234 670 程式記憶器的剩餘容量

3. 按對應於未使用的程式區編號的數字鍵。 <img src="assets/excerpts/17-programming-ch-58-symbol-0935.png" alt="原文符號或待核對字" height="22"> 畫面上出現運行模式選擇清單。 用 ( <img src="assets/excerpts/17-programming-ch-58-symbol-0936.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-58-symbol-0937.png" alt="原文符號或待核對字" height="22"> 選換清單畫面 <img src="assets/excerpts/17-programming-ch-58-symbol-0938.png" alt="原文符號或待核對字" height="22"> 及畫面 <img src="assets/excerpts/17-programming-ch-58-symbol-0939.png" alt="原文符號或待核對字" height="22">

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0313.png)

4. 按對應於要選作程式連行模式的數字鍵。

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0314.png)

選擇作為運行模式， 計算器將顯示程式編輯畫面。 <img src="assets/excerpts/17-programming-ch-58-symbol-0940.png" alt="原文符號或待核對字" height="22">

![Ch-58 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-58-0315.png)

<details>
<summary>原書 Ch-58：完整原文影像（本節範圍）</summary>

![原書 Ch-58 本節範圍](assets/pages/17-programming-ch-58.png)

</details>


<a id="ch-59"></a>

## Ch-59

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0316.png)

程式的運行模式一旦被指定， 便無法改變。 只有在創建新的程式時才能指定運行模式。

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0317.png)

<img src="assets/excerpts/17-programming-ch-59-symbol-0941.png" alt="原文符號或待核對字" height="22"> 下面介紹如何輸入程式。

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0318.png)

令的輸入 ” 一節。

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0319.png)

<img src="assets/excerpts/17-programming-ch-59-symbol-0947.png" alt="原文符號或待核對字" height="22"> 要運行剛剛創建的程式時， 請在此時按 <img src="assets/excerpts/17-programming-ch-59-symbol-0948.png" alt="原文符號或待核對字" height="22"> 顯示程式運行 <img src="assets/excerpts/17-programming-ch-59-symbol-0949.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-59-symbol-0950.png" alt="原文符號或待核對字" height="22"> 畫面。 有關

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0320.png)

<img src="assets/excerpts/17-programming-ch-59-symbol-0952.png" alt="原文符號或待核對字" height="22"> 要返回通常的計算畫面時， 請按 <img src="assets/excerpts/17-programming-ch-59-symbol-0953.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-59-symbol-0954.png" alt="原文符號或待核對字" height="22"> 進入 COMP 模式。

### 現有程式的編輯

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0321.png)

2. 用數字 <img src="assets/excerpts/17-programming-ch-59-symbol-0956.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-59-symbol-0957.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-59-symbol-0958.png" alt="原文符號或待核對字" height="22"> 選擇含有要編輯的程式的程式區。

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0322.png)

<img src="assets/excerpts/17-programming-ch-59-symbol-0961.png" alt="原文符號或待核對字" height="22"> 按 <img src="assets/excerpts/17-programming-ch-59-symbol-0962.png" alt="原文符號或待核對字" height="22"> 可跳至程式的開頭， 而按字 ) 可跳至末 <img src="assets/excerpts/17-programming-ch-59-symbol-0963.png" alt="原文符號或待核對字" height="22">。

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0323.png)

### 程式的運行

程式可以在 PRGM 模式或其他模式中運行。

### 如何在 PRGM 模式以外的模式中運行程式

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0324.png)

2. 用數字 <img src="assets/excerpts/17-programming-ch-59-symbol-0969.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-59-symbol-0970.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-59-symbol-0971.png" alt="原文符號或待核對字" height="22"> 選擇程式區並執行其程式。

### 如何在 PRGM 模式中運行程式

1. 按 <img src="assets/excerpts/17-programming-ch-59-symbol-0973.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-59-symbol-0974.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-59-symbol-0975.png" alt="原文符號或待核對字" height="22"> 顯示 PRGM 模式的初始畫面。

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0325.png)

<img src="assets/excerpts/17-programming-ch-59-symbol-0976.png" alt="原文符號或待核對字" height="22"> 計算器顯示程式運行 <img src="assets/excerpts/17-programming-ch-59-symbol-0977.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-59-symbol-0978.png" alt="原文符號或待核對字" height="22"> 畫面。 已含有程式資料的程式區 <img src="assets/excerpts/17-programming-ch-59-symbol-0979.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-59-symbol-0980.png" alt="原文符號或待核對字" height="22">

![Ch-59 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-59-0326.png)

<details>
<summary>原書 Ch-59：完整原文影像（本節範圍）</summary>

![原書 Ch-59 本節範圍](assets/pages/17-programming-ch-59.png)

</details>


<a id="ch-60"></a>

## Ch-60

3. <img src="assets/excerpts/17-programming-ch-60-symbol-0981.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-0982.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-60-symbol-0983.png" alt="原文符號或待核對字" height="22"> 選擇含有要運行的程式的程式區。 <img src="assets/excerpts/17-programming-ch-60-symbol-0984.png" alt="原文符號或待核對字" height="22"> 您選擇的程式區中的程式便被執行。

### 錯誤訊息出現時應採取的措施

<img src="assets/excerpts/17-programming-ch-60-symbol-0986.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-0987.png" alt="原文符號或待核對字" height="22"> 或 ( <img src="assets/excerpts/17-programming-ch-60-symbol-0988.png" alt="原文符號或待核對字" height="22">。 此時程式的編輯畫面將出 <img src="assets/excerpts/17-programming-ch-60-symbol-0989.png" alt="原文符號或待核對字" height="22"> , 而游標位於錯誤產生的位置， 以便讓您進行修

### 程式的刪除

通過指定程式區編號可以刪除現有的程式。

### 如何刪除指定程式區中的程式

1. <img src="assets/excerpts/17-programming-ch-60-symbol-0990.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-0991.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-0992.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-0993.png" alt="原文符號或待核對字" height="22"> 顯示 PRGM 模式的初始畫面。

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0327.png)

已含有程式資料的程式區 <img src="assets/excerpts/17-programming-ch-60-symbol-0994.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-60-symbol-0995.png" alt="原文符號或待核對字" height="22">

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0328.png)

<img src="assets/excerpts/17-programming-ch-60-symbol-0996.png" alt="原文符號或待核對字" height="22"> 1 234 670 程式記憶器的剩餘容量

3. 用數字 <img src="assets/excerpts/17-programming-ch-60-symbol-0997.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-0998.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-60-symbol-0999.png" alt="原文符號或待核對字" height="22"> 選擇要刪除其程式的程式區。

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0329.png)

### 指令的輸入

### 如何輸入指定程式指令

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0330.png)

<img src="assets/excerpts/17-programming-ch-60-symbol-1003.png" alt="原文符號或待核對字" height="22"> 和此時畫面顯示指令清單的第 <img src="assets/excerpts/17-programming-ch-60-symbol-1004.png" alt="原文符號或待核對字" height="22"> 頁。

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0331.png)

2. <img src="assets/excerpts/17-programming-ch-60-symbol-1005.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-1006.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-1007.png" alt="原文符號或待核對字" height="22"> 選換清單並顯示含有所需指令的畫面。

3. 用數字 <img src="assets/excerpts/17-programming-ch-60-symbol-1008.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-60-symbol-1009.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-60-symbol-1010.png" alt="原文符號或待核對字" height="22"> 選擇並輸入所需要的指令。

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0332.png)

要輸入分號 (:) 時， 請按 <img src="assets/excerpts/17-programming-ch-60-symbol-1011.png" alt="原文符號或待核對字" height="22">。

### 可作為程式指令輸入的功能

在通常的計算時能夠輸入的設定及執行的其他操作都可用作程式指令。 有關詳情， 請參閱下

### 指令參考

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0333.png)

### 指令參考

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0334.png)

本節詳細介紹可以在程式中使用的各種指令。

![Ch-60 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-60-0335.png)

<details>
<summary>原書 Ch-60：完整原文影像（本節範圍）</summary>

![原書 Ch-60 本節範圍](assets/pages/17-programming-ch-60.png)

</details>


<a id="ch-61"></a>

## Ch-61

### 基本計算指令

![Ch-61 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-61-0336.png)

<img src="assets/excerpts/17-programming-ch-61-symbol-1018.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-61-symbol-1019.png" alt="原文符號或待核對字" height="22"> 指令左邊的條件為真則執行 <img src="assets/excerpts/17-programming-ch-61-symbol-1020.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-61-symbol-1021.png" alt="原文符號或待核對字" height="22"> , 然後是 <img src="assets/excerpts/17-programming-ch-61-symbol-1022.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-61-symbol-1023.png" alt="原文符號或待核對字" height="22"> 之後

![Ch-61 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-61-0337.png)

句引及其隨後的語句。

![Ch-61 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-61-0338.png)

執行 <img src="assets/excerpts/17-programming-ch-61-symbol-1031.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-61-symbol-1032.png" alt="原文符號或待核對字" height="22"> , 然後是 <img src="assets/excerpts/17-programming-ch-61-symbol-1033.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-61-symbol-1034.png" alt="原文符號或待核對字" height="22"> 及其他隨後的語句。 <img src="assets/excerpts/17-programming-ch-61-symbol-1035.png" alt="原文符號或待核對字" height="22"> 指令左側的條件的評

![Ch-61 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-61-0339.png)

<details>
<summary>原書 Ch-61：完整原文影像（本節範圍）</summary>

![原書 Ch-61 本節範圍](assets/pages/17-programming-ch-61.png)

</details>


<a id="ch-62"></a>

## Ch-62

其他隨後的語句。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0340.png)

<img src="assets/excerpts/17-programming-ch-62-symbol-1040.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1041.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1042.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1043.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1044.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1045.png" alt="原文符號或待核對字" height="22"> ( 關係運算符

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0341.png)

句法 <img src="assets/excerpts/17-programming-ch-62-symbol-1046.png" alt="原文符號或待核對字" height="22"> 達式 ) <img src="assets/excerpts/17-programming-ch-62-symbol-1047.png" alt="原文符號或待核對字" height="22"> 運算符 <img src="assets/excerpts/17-programming-ch-62-symbol-1048.png" alt="原文符號或待核對字" height="22"> 表達式 <img src="assets/excerpts/17-programming-ch-62-symbol-1049.png" alt="原文符號或待核對字" height="22"> 功能這此指令評價兩邊的表達式， 並返回一個 <img src="assets/excerpts/17-programming-ch-62-symbol-1050.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1051.png" alt="原文符號或待核對字" height="22"> 或假 <img src="assets/excerpts/17-programming-ch-62-symbol-1052.png" alt="原文符號或待核對字" height="22"> 的值。 在構架語句或 <img src="assets/excerpts/17-programming-ch-62-symbol-1053.png" alt="原文符號或待核對字" height="22"> 語句的 <img src="assets/excerpts/17-programming-ch-62-symbol-1054.png" alt="原文符號或待核對字" height="22"> 條件表達式 <img src="assets/excerpts/17-programming-ch-62-symbol-1055.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1056.png" alt="原文符號或待核對字" height="22"> 這些指令與分枝指令 <img src="assets/excerpts/17-programming-ch-62-symbol-1057.png" alt="原文符號或待核對字" height="22"> 一起使用。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0342.png)

這些指令評價兩邊的表達式 <img src="assets/excerpts/17-programming-ch-62-symbol-1058.png" alt="原文符號或待核對字" height="22"> 並返回一個 <img src="assets/excerpts/17-programming-ch-62-symbol-1059.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1060.png" alt="原文符號或待核對字" height="22"> 或假 <img src="assets/excerpts/17-programming-ch-62-symbol-1061.png" alt="原文符號或待核對字" height="22"> 的值， 然後將結果保存在 Ans 中。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0343.png)

<img src="assets/excerpts/17-programming-ch-62-symbol-1062.png" alt="原文符號或待核對字" height="22"> 語句用於根據 <img src="assets/excerpts/17-programming-ch-62-symbol-1063.png" alt="原文符號或待核對字" height="22"> 之後的表達式 <img src="assets/excerpts/17-programming-ch-62-symbol-1064.png" alt="原文符號或待核對字" height="22"> 枝條件 ) 是真還是假來控制程式執行的分枝。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0344.png)

<img src="assets/excerpts/17-programming-ch-62-symbol-1065.png" alt="原文符號或待核對字" height="22"> 表達式 <img src="assets/excerpts/17-programming-ch-62-symbol-1066.png" alt="原文符號或待核對字" height="22"> 指令或 <img src="assets/excerpts/17-programming-ch-62-symbol-1067.png" alt="原文符號或待核對字" height="22"> 指令可在 <img src="assets/excerpts/17-programming-ch-62-symbol-1068.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1069.png" alt="原文符號或待核對字" height="22"> 後面的 <img src="assets/excerpts/17-programming-ch-62-symbol-1070.png" alt="原文符號或待核對字" height="22"> 表達式 <img src="assets/excerpts/17-programming-ch-62-symbol-1071.png" alt="原文符號或待核對字" height="22"> 中使用。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0345.png)

功能 <img src="assets/excerpts/17-programming-ch-62-symbol-1072.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1073.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1074.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1075.png" alt="原文符號或待核對字" height="22"> 面的條件語句為真時， 程式執行從 <img src="assets/excerpts/17-programming-ch-62-symbol-1076.png" alt="原文符號或待核對字" height="22"> 到 <img src="assets/excerpts/17-programming-ch-62-symbol-1077.png" alt="原文符號或待核對字" height="22"> 之間的語句， 然後執

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0346.png)

句後執行 <img src="assets/excerpts/17-programming-ch-62-symbol-1081.png" alt="原文符號或待核對字" height="22"> 後面的語句。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0347.png)

<img src="assets/excerpts/17-programming-ch-62-symbol-1082.png" alt="原文符號或待核對字" height="22"> 必須含有 <img src="assets/excerpts/17-programming-ch-62-symbol-1083.png" alt="原文符號或待核對字" height="22"> : <img src="assets/excerpts/17-programming-ch-62-symbol-1084.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1085.png" alt="原文符號或待核對字" height="22"> 將其省略不會產生錯誤， 但 <img src="assets/excerpts/17-programming-ch-62-symbol-1086.png" alt="原文符號或待核對字" height="22"> 後面的程式可能會產生意想不到的結果。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0348.png)

### 結構控制指令 / For 語句 EER)

只要控制變量中的值在指定範圍之內 <img src="assets/excerpts/17-programming-ch-62-symbol-1091.png" alt="原文符號或待核對字" height="22"> 語句便會反覆執行 <img src="assets/excerpts/17-programming-ch-62-symbol-1092.png" alt="原文符號或待核對字" height="22"> 與 <img src="assets/excerpts/17-programming-ch-62-symbol-1093.png" alt="原文符號或待核對字" height="22"> 之間的語句。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0349.png)

<img src="assets/excerpts/17-programming-ch-62-symbol-1094.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1095.png" alt="原文符號或待核對字" height="22"> 語句必須總是伴有 <img src="assets/excerpts/17-programming-ch-62-symbol-1096.png" alt="原文符號或待核對字" height="22"> 語句。 使用 <img src="assets/excerpts/17-programming-ch-62-symbol-1097.png" alt="原文符號或待核對字" height="22"> 但沒有相應的 <img src="assets/excerpts/17-programming-ch-62-symbol-1098.png" alt="原文符號或待核對字" height="22"> 時將產生句法錯誤 <img src="assets/excerpts/17-programming-ch-62-symbol-1099.png" alt="原文符號或待核對字" height="22">

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0350.png)

<img src="assets/excerpts/17-programming-ch-62-symbol-1100.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-62-symbol-1101.png" alt="原文符號或待核對字" height="22"> 語句中不能含有 <img src="assets/excerpts/17-programming-ch-62-symbol-1102.png" alt="原文符號或待核對字" height="22"> 語句。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0351.png)

功能反復執行從 <img src="assets/excerpts/17-programming-ch-62-symbol-1103.png" alt="原文符號或待核對字" height="22"> 到 <img src="assets/excerpts/17-programming-ch-62-symbol-1104.png" alt="原文符號或待核對字" height="22"> 之間的語句時， 控制變量將從開始值開始， 每執行 <img src="assets/excerpts/17-programming-ch-62-symbol-1105.png" alt="原文符號或待核對字" height="22"> 次便加 <img src="assets/excerpts/17-programming-ch-62-symbol-1106.png" alt="原文符號或待核對字" height="22"> 當控制值到達結束值時 <img src="assets/excerpts/17-programming-ch-62-symbol-1107.png" alt="原文符號或待核對字" height="22"> 程式跳至 <img src="assets/excerpts/17-programming-ch-62-symbol-1108.png" alt="原文符號或待核對字" height="22"> 後面的語句執行。 若 <img src="assets/excerpts/17-programming-ch-62-symbol-1109.png" alt="原文符號或待核對字" height="22"> 後面沒有語句， 程式便停止執行。

![Ch-62 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-62-0352.png)

<details>
<summary>原書 Ch-62：完整原文影像（本節範圍）</summary>

![原書 Ch-62 本節範圍](assets/pages/17-programming-ch-62.png)

</details>


<a id="ch-63"></a>

## Ch-63

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0353.png)

功能反復執行從 <img src="assets/excerpts/17-programming-ch-63-symbol-1110.png" alt="原文符號或待核對字" height="22"> 到 <img src="assets/excerpts/17-programming-ch-63-symbol-1111.png" alt="原文符號或待核對字" height="22"> 之間的語句時， 控制 <img src="assets/excerpts/17-programming-ch-63-symbol-1112.png" alt="原文符號或待核對字" height="22"> 量將從開始值開始， <img src="assets/excerpts/17-programming-ch-63-symbol-1113.png" alt="原文符號或待核對字" height="22"> 執行 <img src="assets/excerpts/17-programming-ch-63-symbol-1114.png" alt="原文符號或待核對字" height="22"> 次便加步數。 除此點之外， 此指令與 <img src="assets/excerpts/17-programming-ch-63-symbol-1115.png" alt="原文符號或待核對字" height="22"> 相同。

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0354.png)

<img src="assets/excerpts/17-programming-ch-63-symbol-1116.png" alt="原文符號或待核對字" height="22"> 結構控制指令 <img src="assets/excerpts/17-programming-ch-63-symbol-1117.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-63-symbol-1118.png" alt="原文符號或待核對字" height="22"> 語句 <img src="assets/excerpts/17-programming-ch-63-symbol-1119.png" alt="原文符號或待核對字" height="22">

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0355.png)

<img src="assets/excerpts/17-programming-ch-63-symbol-1120.png" alt="原文符號或待核對字" height="22"> 語句中不能含有 <img src="assets/excerpts/17-programming-ch-63-symbol-1121.png" alt="原文符號或待核對字" height="22"> 語句。

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0356.png)

功能當 <img src="assets/excerpts/17-programming-ch-63-symbol-1122.png" alt="原文符號或待核對字" height="22"> 後面的條件表達式為真 ( 非零 ) 時， 程式反復執行 <img src="assets/excerpts/17-programming-ch-63-symbol-1123.png" alt="原文符號或待核對字" height="22"> 至 <img src="assets/excerpts/17-programming-ch-63-symbol-1124.png" alt="原文符號或待核對字" height="22">

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0357.png)

後面的語句。

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0358.png)

當此指令首次被執行時， 若 <img src="assets/excerpts/17-programming-ch-63-symbol-1129.png" alt="原文符號或待核對字" height="22"> 語句的條件為假， 執行 <img src="assets/excerpts/17-programming-ch-63-symbol-1130.png" alt="原文符號或待核對字" height="22"> 跳至 <img src="assets/excerpts/17-programming-ch-63-symbol-1131.png" alt="原文符號或待核對字" height="22"> 後面的語句， 而

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0359.png)

<img src="assets/excerpts/17-programming-ch-63-symbol-1134.png" alt="原文符號或待核對字" height="22"> 程式控制指令

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0360.png)

功能此指令強制中斷 <img src="assets/excerpts/17-programming-ch-63-symbol-1135.png" alt="原文符號或待核對字" height="22"> 或 <img src="assets/excerpts/17-programming-ch-63-symbol-1136.png" alt="原文符號或待核對字" height="22"> 循環 <img src="assets/excerpts/17-programming-ch-63-symbol-1137.png" alt="原文符號或待核對字" height="22"> 並跳至下一個指令。 通常， 此指令用在 <img src="assets/excerpts/17-programming-ch-63-symbol-1138.png" alt="原文符號或待核對字" height="22"> 語句中。 提供 <img src="assets/excerpts/17-programming-ch-63-symbol-1139.png" alt="原文符號或待核對字" height="22"> 的條件。

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0361.png)

這些指令的功能與計算器的各種設置相同。 有關詳情 <img src="assets/excerpts/17-programming-ch-63-symbol-1140.png" alt="原文符號或待核對字" height="22"> 請參閱第 7 頁上的 <img src="assets/excerpts/17-programming-ch-63-symbol-1141.png" alt="原文符號或待核對字" height="22"> 器設置 <img src="assets/excerpts/17-programming-ch-63-symbol-1142.png" alt="原文符號或待核對字" height="22">

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0362.png)

對於有些設置指令 <img src="assets/excerpts/17-programming-ch-63-symbol-1143.png" alt="原文符號或待核對字" height="22"> 即使程式運行結束了， 該指令所做的設置仍將繼續有效。 角度單位指令

![Ch-63 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-63-0363.png)

功能這些指令指定角度單位。

<details>
<summary>原書 Ch-63：完整原文影像（本節範圍）</summary>

![原書 Ch-63 本節範圍](assets/pages/17-programming-ch-63.png)

</details>


<a id="ch-64"></a>

## Ch-64

顯示形式指令

![Ch-64 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-64-0364.png)

功能此指令清除保存在記憶器中的所有統計樣本資料。

<details>
<summary>原書 Ch-64：完整原文影像（本節範圍）</summary>

![原書 Ch-64 本節範圍](assets/pages/17-programming-ch-64.png)

</details>


<a id="ch-65"></a>

## Ch-65

<img src="assets/excerpts/17-programming-ch-65-symbol-1144.png" alt="原文符號或待核對字" height="22"> 獨立記憶器指令

![Ch-65 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-65-0365.png)

要在上示句法中輸入分號 <img src="assets/excerpts/17-programming-ch-65-symbol-1145.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-65-symbol-1146.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-65-symbol-1147.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-65-symbol-1148.png" alt="原文符號或待核對字" height="22"> 要輸入逗號 (,) 時， 請按 <img src="assets/excerpts/17-programming-ch-65-symbol-1149.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-65-symbol-1150.png" alt="原文符號或待核對字" height="22">。

![Ch-65 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-65-0366.png)

功能此指令用於輸入樣本資料組。 在 SD 模式及 REG 模式中 <img src="assets/excerpts/17-programming-ch-65-symbol-1151.png" alt="原文符號或待核對字" height="22"> 指令的功能與

![Ch-65 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-65-0367.png)

### 不能在程式中使用的功能

![Ch-65 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-65-0368.png)

計算結果變換函數 <img src="assets/excerpts/17-programming-ch-65-symbol-1153.png" alt="原文符號或待核對字" height="22"> 一 <img src="assets/excerpts/17-programming-ch-65-symbol-1154.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/17-programming-ch-65-symbol-1155.png" alt="原文符號或待核對字" height="22"> , 六十進制 <img src="assets/excerpts/17-programming-ch-65-symbol-1156.png" alt="原文符號或待核對字" height="22"> 進制變換， 分數 <img src="assets/excerpts/17-programming-ch-65-symbol-1157.png" alt="原文符號或待核對字" height="22"> 數變換 )

![Ch-65 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/17-programming-ch-65-0369.png)

<details>
<summary>原書 Ch-65：完整原文影像（本節範圍）</summary>

![原書 Ch-65 本節範圍](assets/pages/17-programming-ch-65.png)

</details>


[← 內置公式](16-built-in-formulas.md) · [目錄](README.md) · [附錄 →](18-appendix.md)
