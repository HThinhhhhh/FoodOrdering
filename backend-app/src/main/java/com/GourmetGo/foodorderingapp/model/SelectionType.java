package com.GourmetGo.foodorderingapp.model;

public enum SelectionType {
    /**
     * Phải chọn 1 (Vd: Size)
     * Sẽ hiển thị là Radio Button
     */
    SINGLE_REQUIRED,

    /**
     * Có thể chọn 1 hoặc không chọn (Vd: Chọn 1 loại sốt, hoặc không)
     * Sẽ hiển thị là Radio Button (với tùy chọn "Không")
     */
    SINGLE_OPTIONAL,

    /**
     * Có thể chọn nhiều, hoặc không chọn (Vd: Topping)
     * Sẽ hiển thị là Checkbox
     */
    MULTI_SELECT
}