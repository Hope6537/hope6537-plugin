/*
 * Copyright (c) 2015. Hope6537 The Founder of Lab.JiChuang ,ChangChun University,
 * JiLin Province,China
 * JiChuang CloudStroage is a maven webapp using Hadoop Distributed File System for storage ' s Cloud Stroage System
 */

/**
 * Created by Zhaopeng-Rabook on 14-12-23.
 */
/**
 * 首先是全局的地址
 */
var basePath = function () {
    var url = window.location + "";
    var h = url.split("//");
    var x = h[1].split("/");
    return h[0] + "//" + window.location.host + "/" + x[1] + "/";
}();

var globalConstant = {
    AESKEY: "Hope6537JiChuang",
    AESIV: "1234567812345678",
    YES: "是",
    NO: "否",
    FOUNDER: "创建者",
    READER: "只读",
    WRITER: "读写",
    FOLDER: "文件夹",
    FILE: "文件",
    STATUS_NORMAL: "正常",
    STATUS_DIE: "不可用",
    STATUS_JUDGE: "待审核"
};

var globalFunction = {
    autoCompleteDriver: function (targetUrl, method, formData, autoCompleteInput, putSelectionFunction, afterDataFunction) {
        $.ajax({
            url: targetUrl,
            type: method,
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (data) {
                if (globalFunction.returnResult(data, undefined, false)) {
                    var dataList = putSelectionFunction(data);
                    $(autoCompleteInput).autocomplete({
                        lookup: dataList,
                        onSelect: function (suggestion) {
                            afterDataFunction(suggestion);
                        }
                    });
                }
            }
        });
    },
    autoCompleteBySelect2: function (targetUrl, method, formData, autoCompleteInput, afterDataFunction) {
        var targetIndex = $(autoCompleteInput);
        $.ajax({
            url: targetUrl,
            contentType: 'application/json',
            type: method,
            async: false,
            success: function (data) {
                if (globalFunction.returnResult(data, undefined, false)) {
                    afterDataFunction(data, targetIndex);
                }
            }
        })
    },
    returnResult: function (data, message, binding, failmessage) {
        var messageNull = message == "" || message == undefined;
        var failMessageNull = failmessage = "" || failmessage == undefined;
        if (data.ok) {
            if (binding != false)
                toast.success(messageNull ? data.returnMsg : message);
            return true;
        }
        else if (data.warning) {
            toast.error(failMessageNull ? data.returnMsg : failmessage)
            return false;
        } else {
            toast.error(failMessageNull ? data.returnMsg : failmessage);
            return false;
        }
    },
    replaceHtml: function (S) {
        var str = S;
        str = str.replace(/<[^>].*?>/g, '');
        str = str.replace("&nbsp;", "");
        return str;
    },
    delHtmlTag: function (str) {
        var str = str.replace(/<\/?[^>]*>/gim, "");//去掉所有的html标记
        var result = str.replace(/(^\s+)|(\s+$)/g, "");//去掉前后空格
        return result.replace(/\s/g, "");//去除文章中间空格
    },
    Encrypt: function (word) {
        var key = CryptoJS.enc.Utf8.parse(globalConstant.AESKEY);
        var iv = CryptoJS.enc.Utf8.parse(globalConstant.AESIV);
        var srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }
    ,
    Decrypt: function (word) {
        var key = CryptoJS.enc.Utf8.parse(globalConstant.AESKEY);
        var iv = CryptoJS.enc.Utf8.parse(globalConstant.AESIV);
        var decrypted = CryptoJS.AES.decrypt(word, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}

$(function () {
    //此函数为了处理firefox及chrome中，在弹出的窗口中点击ckeditor的上传图片，显示的input无法获取光标的问题
    $.fn.modal.Constructor.prototype.enforceFocus = function () {
        modal_this = this;
        $(document).on('focusin.modal', function (e) {
            if (modal_this.$element[0] !== e.target && !modal_this.$element.has(e.target).length
                && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_select')
                && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_text')) {
                modal_this.$element.focus()
            }
        })
    };
    $.ajaxSetup({
        cache: false,
        dataType: "json",
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.responseJSON) {
                toast.error(XMLHttpRequest.responseJSON.returnMsg);
            } else {
                toast.error("状态：" + XMLHttpRequest.status + ", 错误：" + XMLHttpRequest.statusText)
            }
            Metronic.unblockUI(customGlobal.blockUITarget);
        }
    });
    $.validator.setDefaults({
        errorElement: 'span', //default input error message container
        errorClass: 'help-block help-block-error', // default input error message class
        focusInvalid: true,
        ignore: "",  // validate all fields including form hidden input
        highlight: function (element) { // hightlight error inputs
            $(element).closest('.form-group').addClass('has-error'); // set error class to the control group
        },
        unhighlight: function (element) { // revert the change done by hightlight
            $(element).closest('.form-group').removeClass('has-error'); // set error class to the control group
        },
        success: function (label) {
            label.closest('.form-group').removeClass('has-error'); // set success class to the control group
        },
        invalidHandler: function (event, validator) { //display error alert on form submit
            toastr.error("表单信息填写有误，请核对后再提交。");
        }
    });
    $.validator.messages.equalTo = "两次输入不相同";
    $("#menu_" + $("#menuParentId").val()).addClass("active").find("span.arrow").addClass("open");
    $("#menu_" + $("#menuId").val()).addClass("active");
    var $menuSearch = $("#menuSearch").on("keydown", function (e) {
        var $this = $(this);
        var menuId = $this.getGAutoHiddenValue();
        if (e.which == 13 && menuId != undefined && menuId != "") {
            e.preventDefault();
            customGlobal.menuSearch(menuId);
        }
    });
    $("#menuSearchBtn").on("click", function () {
        var menuId = $menuSearch.getGAutoHiddenValue();
        if (menuId != undefined && menuId != "") {
            customGlobal.menuSearch(menuId)
        }
    });
    customGlobal.initUpdatePasswordEvent();
});
var customGlobal = {
    onSortColumnDefault: function (sortColumn, sortDirection) {
        return {
            sortColumn: sortColumn,
            sortDirection: sortDirection
        }
    },
    blockUI: function (target) {
        if (target !== undefined) {
            customGlobal.blockUITarget = target;
            Metronic.blockUI({
                target: target,
                boxed: true,
                message: '载入中，请稍候...'
            });
        } else {
            Metronic.blockUI({
                boxed: true,
                message: '载入中，请稍候...'
            });
        }
    },
    ajaxCallback: function (data) {
        Metronic.unblockUI(customGlobal.blockUITarget);
        if (data.ok) {
            toast.success(data.returnMsg);
            return true;
        } else if (data.error) {
            toast.error(data.returnMsg);
            return false;
        } else if (data.warn) {
            toast.warn(data.returnMsg);
            return true;
        }
    },
    clearFormAndShowDialog: function (dialogId) {
        $("#" + dialogId).find("input:text,input:password,select,textarea").val("").end().modal("show").find("div.form-group").removeClass("has-error");
    },
    menuSearch: function (menuId) {
        $.post("develop/menu/menuSearch", {menuId: menuId}, function (data) {
            if (customGlobal.ajaxCallback(data)) {
                location.href = data.returnData.url;
            }
        })
    },
    initUpdatePasswordEvent: function () {
        $("#updatePass").on("click", function () {
            customGlobal.clearFormAndShowDialog("updatePasswordModal");
            $("#updatePasswordDialog").validate({
                rules: {
                    oldPassword: {
                        required: true
                    },
                    reNewPassword: {
                        equalTo: "#newPassword"
                    }
                }
            }).resetForm();
            $("#passwordHelpBlock").html("");
        });

        $("#updatePassword").on("click", function () {
            customGlobal.blockUI("#updatePasswordContent");
            $.ajax({
                url: "security/user/updatePassword",
                data: {
                    oldPassword: $("#oldPassword").val().md5(),
                    newPassword: $("#newPassword").val().md5()
                },
                type: "post",
                success: function (data) {
                    if (customGlobal.ajaxCallback(data)) {
                        $("#updatePasswordModal").modal("hide");
                    }
                }
            });
        });
    },
    generalClass: {
        0: "label-danger",
        1: "label-success"
    }
};


