# 附錄

[← 程式模式（PRGM）](17-programming.md) · [目錄](README.md) · [電源要求 →](19-power-supply.md)

> 原書頁碼：Ch-66–Ch-70。繁體中文；公式、鍵序及辨識不確定處保留原文影像。文字辨識限制見[轉換說明](README.md#轉換說明)。

本節內容：

- [計算的優先順序（Ch-66）](#ch-66)
- [堆棧限度（Ch-67）](#ch-67)
- [計算範圍、位數及精度（Ch-67）](#ch-67)
- [錯誤訊息（Ch-69）](#ch-69)
- [在懷疑是計算器發生了故障之前（Ch-70）](#ch-70)

<a id="ch-66"></a>

## Ch-66

![Ch-66 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-66-0370.png)

### 計算的優先順序

計算器根據下示優先順序進行您輸入的計算。

![Ch-66 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-66-0371.png)

<img src="assets/excerpts/18-appendix-ch-66-symbol-1159.png" alt="原文符號或待核對字" height="22"> 若計算中含有負值， 則負值可能需要括在括號中。 例如， 若要計算 <img src="assets/excerpts/18-appendix-ch-66-symbol-1160.png" alt="原文符號或待核對字" height="22"> 的平方， 則需要輸入 <img src="assets/excerpts/18-appendix-ch-66-symbol-1161.png" alt="原文符號或待核對字" height="22">

![Ch-66 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-66-0372.png)

<details>
<summary>原書 Ch-66：完整原文影像（本節範圍）</summary>

![原書 Ch-66 本節範圍](assets/pages/18-appendix-ch-66.png)

</details>


<a id="ch-67"></a>

## Ch-67

<img src="assets/excerpts/18-appendix-ch-67-symbol-1165.png" alt="原文符號或待核對字" height="22"> 和如以下範例所示， 省 <img src="assets/excerpts/18-appendix-ch-67-symbol-1166.png" alt="原文符號或待核對字" height="22"> 符號的乘法優先於 <img src="assets/excerpts/18-appendix-ch-67-symbol-1167.png" alt="原文符號或待核對字" height="22"> 符號的乘法和除法。

![Ch-67 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-67-0373.png)

### 堆棧限度

本計算器使用稱為 “ 堆棧 ” 的記憶區來暫時儲存優先順序較低的數值、 指令及函數 <img src="assets/excerpts/18-appendix-ch-67-symbol-1168.png" alt="原文符號或待核對字" height="22"> 數字堆棧 ” 有

![Ch-67 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-67-0374.png)

當您進行的計算超出了堆棧的容量時， 堆棧錯誤 <img src="assets/excerpts/18-appendix-ch-67-symbol-1172.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-67-symbol-1173.png" alt="原文符號或待核對字" height="22"> 會發生。

![Ch-67 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-67-0375.png)

在 CMPLX 模式中輸入數值時 <img src="assets/excerpts/18-appendix-ch-67-symbol-1174.png" alt="原文符號或待核對字" height="22"> 各數值佔用兩個堆棧級： 一個用於儲存實數部分， 另一個用於儲存虛

![Ch-67 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-67-0376.png)

### 計算範圍、位數及精度

下表列出了計算範圍 <img src="assets/excerpts/18-appendix-ch-67-symbol-1176.png" alt="原文符號或待核對字" height="22"> 值輸入及 <img src="assets/excerpts/18-appendix-ch-67-symbol-1177.png" alt="原文符號或待核對字" height="22"> 範圍 <img src="assets/excerpts/18-appendix-ch-67-symbol-1178.png" alt="原文符號或待核對字" height="22"> 內部計算使用的位數， 以及計算精度。

![Ch-67 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-67-0377.png)

一般來說， 在一次計算中， 第 <img src="assets/excerpts/18-appendix-ch-67-symbol-1179.png" alt="原文符號或待核對字" height="22"> 位的精度為士 <img src="assets/excerpts/18-appendix-ch-67-symbol-1180.png" alt="原文符號或待核對字" height="22"> 指數形式計算結果 <img src="assets/excerpts/18-appendix-ch-67-symbol-1181.png" alt="原文符號或待核對字" height="22">

![Ch-67 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-67-0378.png)

<details>
<summary>原書 Ch-67：完整原文影像（本節範圍）</summary>

![原書 Ch-67 本節範圍](assets/pages/18-appendix-ch-67.png)

</details>


<a id="ch-68"></a>

## Ch-68

![Ch-68 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-68-0379.png)

<details>
<summary>原書 Ch-68：完整原文影像（本節範圍）</summary>

![原書 Ch-68 本節範圍](assets/pages/18-appendix-ch-68.png)

</details>


<a id="ch-69"></a>

## Ch-69

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0380.png)

<img src="assets/excerpts/18-appendix-ch-69-symbol-1183.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-69-symbol-1184.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-69-symbol-1185.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-69-symbol-1186.png" alt="原文符號或待核對字" height="22"> 分子及分母的位數合計必須在 10 位以內 <img src="assets/excerpts/18-appendix-ch-69-symbol-1187.png" alt="原文符號或待核對字" height="22"> 中包括分隔符 <img src="assets/excerpts/18-appendix-ch-69-symbol-1188.png" alt="原文符號或待核對字" height="22">

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0381.png)

<img src="assets/excerpts/18-appendix-ch-69-symbol-1189.png" alt="原文符號或待核對字" height="22"> 在函數的 <img src="assets/excerpts/18-appendix-ch-69-symbol-1190.png" alt="原文符號或待核對字" height="22"> 點及拐點附近誤差有 <img src="assets/excerpts/18-appendix-ch-69-symbol-1191.png" alt="原文符號或待核對字" height="22"> 及 <img src="assets/excerpts/18-appendix-ch-69-symbol-1192.png" alt="原文符號或待核對字" height="22"> 大的傾向。 <img src="assets/excerpts/18-appendix-ch-69-symbol-1193.png" alt="原文符號或待核對字" height="22">

### 錯誤訊息

若計算超出了計算器的限度， 或若進行了不允許的操作， 畫面上將 <img src="assets/excerpts/18-appendix-ch-69-symbol-1194.png" alt="原文符號或待核對字" height="22">

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0382.png)

錯誤訊息 <img src="assets/excerpts/18-appendix-ch-69-symbol-1195.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-69-symbol-1196.png" alt="原文符號或待核對字" height="22"> 錯誤訊息的清除無論錯誤類型為何， 執行下述鍵操作可清除錯誤訊息。

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0383.png)

有關詳情請參閱第 12 頁上的 <img src="assets/excerpts/18-appendix-ch-69-symbol-1197.png" alt="原文符號或待核對字" height="22"> 位置的查找 ” 一節。

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0384.png)

<img src="assets/excerpts/18-appendix-ch-69-symbol-1200.png" alt="原文符號或待核對字" height="22"> 錯誤訊息參考本節列出了計算器所顯示的所有錯誤訊息， 其原因及避免措施。

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0385.png)

<img src="assets/excerpts/18-appendix-ch-69-symbol-1201.png" alt="原文符號或待核對字" height="22"> 中間計算結果或最終計算結果超出了容許的計算範圍。

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0386.png)

<img src="assets/excerpts/18-appendix-ch-69-symbol-1203.png" alt="原文符號或待核對字" height="22"> 非法的算數運算 ( 除以零等 <img src="assets/excerpts/18-appendix-ch-69-symbol-1204.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-69-symbol-1205.png" alt="原文符號或待核對字" height="22"> 若需要， 請檢查輸入的數值並減少位數。

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0387.png)

<img src="assets/excerpts/18-appendix-ch-69-symbol-1207.png" alt="原文符號或待核對字" height="22"> 的容許範圍之內。

有關資料的容許輸入範圍的說明， 請參閱第 67 頁上的 <img src="assets/excerpts/18-appendix-ch-69-symbol-1208.png" alt="原文符號或待核對字" height="22"> 範圍、 位數及精度 ” 一節。

![Ch-69 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-69-0388.png)

有關堆棧容量的說明， 請參閱第 67 頁上的 “ 堆棧限度 ” 一節。

<details>
<summary>原書 Ch-69：完整原文影像（本節範圍）</summary>

![原書 Ch-69 本節範圍](assets/pages/18-appendix-ch-69.png)

</details>


<a id="ch-70"></a>

## Ch-70

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0389.png)

在 SD 模式或 REG 模式中， 當記憶器中已保存有所定數量上限的樣本資料時試圖繼續保存樣本資料。

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0390.png)

請將樣本資料的數量限制在容許限度之內。 有關詳情， 請參閱第 35 頁上的 <img src="assets/excerpts/18-appendix-ch-70-symbol-1209.png" alt="原文符號或待核對字" height="22"> 項的輸入數目限度。

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0391.png)

程式 <img src="assets/excerpts/18-appendix-ch-70-symbol-1210.png" alt="原文符號或待核對字" height="22"> PRGM 模式中建立的 ) 中有 <img src="assets/excerpts/18-appendix-ch-70-symbol-1211.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-70-symbol-1212.png" alt="原文符號或待核對字" height="22"> 但沒有相應的

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0392.png)

追加一個 <img src="assets/excerpts/18-appendix-ch-70-symbol-1213.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-70-symbol-1214.png" alt="原文符號或待核對字" height="22"> 來配合 <img src="assets/excerpts/18-appendix-ch-70-symbol-1215.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-70-symbol-1216.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-70-symbol-1217.png" alt="原文符號或待核對字" height="22"> 或刪除相應的 <img src="assets/excerpts/18-appendix-ch-70-symbol-1218.png" alt="原文符號或待核對字" height="22"> 五指令。

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0393.png)

### 在懷疑是計算器發生了故障之前

在計算過程中發生了錯誤， 或計算結果超出意外時：, 請執行下述操作。 若一步末能解決問題， 則移至下一步。 請注意， 在進行這些操作之前 <img src="assets/excerpts/18-appendix-ch-70-symbol-1219.png" alt="原文符號或待核對字" height="22"> 請對重要資料進行備份。

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0394.png)

<img src="assets/excerpts/18-appendix-ch-70-symbol-1221.png" alt="原文符號或待核對字" height="22"> 確認您要進行的計算是在正確的模式中進行的。

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0395.png)

計算器發現了問題， 其將返回計算模式並復原初始預設配置， 並且清除記憶器中的所有資料。 <img src="assets/excerpts/18-appendix-ch-70-symbol-1225.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-70-symbol-1226.png" alt="原文符號或待核對字" height="22"> <img src="assets/excerpts/18-appendix-ch-70-symbol-1227.png" alt="原文符號或待核對字" height="22"> 步未能使操作恢復正常， 請進行下列 <img src="assets/excerpts/18-appendix-ch-70-symbol-1228.png" alt="原文符號或待核對字" height="22"> 操作初始化所有模式及設定：

![Ch-70 原文：算式、鍵序、圖表或待核對文字](assets/excerpts/18-appendix-ch-70-0396.png)

<details>
<summary>原書 Ch-70：完整原文影像（本節範圍）</summary>

![原書 Ch-70 本節範圍](assets/pages/18-appendix-ch-70.png)

</details>


[← 程式模式（PRGM）](17-programming.md) · [目錄](README.md) · [電源要求 →](19-power-supply.md)
