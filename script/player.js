var playlist = [{ "title": "Autumn Leaves", "artist": "Eva Cassidy, Katie Melua" },
{ "title": "Road To Marrakesh", "artist": "Johannes Linstead" },
{ "title": "Entre Dos Aguas", "artist": "Paco de Lucía" }];
var colors = [{ "color": "red" }, { "color": "orange" }, { "color": "yellow" }, { "color": "green" }, { "color": "teal" },
{ "color": "blue" }, { "color": "purple" }, { "color": "pink" }, { "color": "Cyan" }, { "color": "lavender" }];
var weathers = [{ "weather": "晴" }, { "weather": "阴天" }, { "weather": "多云" }, { "weather": "小雨" }, { "weather": "大雨" },
{ "weather": "雷阵雨" }, { "weather": "冰雹" }, { "weather": "小雪" }, { "weather": "大雪" }, { "weather": "雾霾" }];
var numChinese = [{ "num": "一" }, { "num": "二" }, { "num": "三" }, { "num": "四" }, { "num": "五" }, { "num": "六" },
{ "num": "七" }, { "num": "八" }, { "num": "九" }, { "num": "十" }, { "num": "十一" }, { "num": "十二" }];
var animations = [{ "animation": "calender-rotate" }, { "animation": "calender-rotate" }, { "animation": "calender-leftOut" },
{ "animation": "calender-topOut" }, { "animation": "calender-bounce" }, { "animation": "calender-rotate" },
{ "animation": "calender-topOut" }, { "animation": "calender-leftOut" }, { "animation": "calender-topOut" }, { "animation": "calender-bounce" }];
var audios, marquees;
var no = Math.floor(Math.random() * playlist.length);
var alter = 0;
var isInitial = true;
var direction = '';
var starId = 0;
var isFlower = false;

$(function () {
    initData();

    setPlayer();

    setCalender();

    setHead();

    setPlaylist();

    //无限射击
    setInterval(function () { $('#icon').trigger('click') }, 5000);

    //无限闪烁
    setInterval(function () { $('#title').trigger('mouseover') }, 200);
});

//初始化数据
function initData() {
    audios = $('audio');
    marquees = $('marquee');

    //音乐源
    audios[0].src = '../music/' + playlist[no]['title'] + '.mp3';

    //日历背景源
    changeImg();
}

//初始化播放器
function setPlayer() {
    //音频加载完成后
    audios.on('loadedmetadata', function () {
        //一开始是否自动播放
        //audios[0].autoplay = false;
        audios[0].autoplay = true;

        //设置歌曲信息
        marquees.html(playlist[no]['title'] + ' -- ' + playlist[no]['artist']);

        //设置歌曲时长
        $('#duration').html(timeFormat(audios[0].duration));

        //设置歌曲音量
        audios[0].volume = $('#volumeNow').width() / $('#volumeFull').width();
    });

    //正在播放时
    audios.on('timeupdate', function () {
        $('#progressNow').width(audios[0].currentTime / audios[0].duration * 100 + '%');
        $('#currentTime').html(timeFormat(audios[0].currentTime));
    });

    //播放结束后
    audios.on('ended', function () {
        /////触发按钮的一个事件
        $('#next').trigger('click');
    });

    //控制进度条
    $('#progressFull').on('mousedown', function (e) {
        //刚点击时瞬移进度条
        $('#progressNow').width(e.pageX - 55);
        //容错处理
        var rate = $('#progressNow').width() / $('#progressFull').width();
        audios[0].currentTime = (rate >= 0.99 ? 0.99 : rate) * audios[0].duration;
        $('#currentTime').html(timeFormat(audios[0].currentTime));

        //在播放器内拖动进度条
        $('#player').on('mousemove', function (e) {
            //100%会直接跳到下一首，并且接下来的值一开始没有定义无法计算
            $('#progressNow').width(e.pageX >= $('#player').width() - 55 ? '99%' : e.pageX - 55);
            audios[0].currentTime = $('#progressNow').width() / $('#progressFull').width() * audios[0].duration;
            $('#currentTime').html(timeFormat(audios[0].currentTime));
        });

        //在整个页面内（或者离开页面后）松开鼠标移除拖动进度条事件（一次性）
        $(document).one('mouseup', function () {
            $('#player').off('mousemove');
            //$(document).off('mouseup');
        });
    });

    //点击静音按钮
    $('#mute').on('click', function () {
        audios[0].muted = true;
        $('#volumeNow').width(0);
        audios[0].volume = 0;
    });

    //点击音量最大按钮
    $('#full').on('click', function () {
        audios[0].muted = false;
        $('#volumeNow').width('100%');
        audios[0].volume = 1;
    });

    //控制音量条
    $('#volumeFull').on('mousedown', function (e) {
        audios[0].muted = false;

        //刚点击时瞬移音量条
        $('#volumeNow').width((e.pageX - 233) / $('#volumeFull').width() * 100 + '%');
        audios[0].volume = $('#volumeNow').width() / $('#volumeFull').width();

        //在播放器内拖动音量条
        $('#player').on('mousemove', function (e) {
            $('#volumeNow').width(e.pageX >= $('#player').width() - 44 ? '100%' : (e.pageX - 233) / $('#volumeFull').width() * 100 + '%');
            //容错处理
            audios[0].volume = $('#volumeNow').width() / $('#volumeFull').width() >= 1 ? 1 : $('#volumeNow').width() / $('#volumeFull').width();
        });

        //在整个页面内（或者离开页面后）松开鼠标移除拖动音量条事件（一次性）
        $(document).one('mouseup', function () {
            $('#player').off('mousemove');
        });
    });

    //暂停/播放
    $('#play').toggle(function () {
        audios[0].pause();
        marquees[0].stop();

        changeFlower();
    }, function () {
        audios[0].play();
        marquees[0].start();

        changeFlower();
    });

    //重新播放
    $('#replay').on('click', function () {
        audios[0].load();

        changeFlower();
    });

    //上一首
    $('#previous').on('click', function () {
        if (--no == -1)
            no = playlist.length - 1;

        playNew();

        changeImg();
        changeFlower();
    });

    //下一首
    $('#next').on('click', function () {
        if (++no == playlist.length)
            no = 0;

        playNew();

        changeImg();
        changeFlower();
    });

    //滚动字幕悬停（Chrome浏览器悬停次数过多后失效，且有时会出现重新滚动现象）
    marquees.hover(function () {
        marquees[0].stop();
    }, function () {
        marquees[0].start();
    });

    //鼠标在字幕周围移动出现闪烁小星星
    $('#title').on('mouseover', function () {
        var count = Math.floor(Math.random() * 5) + 1;
        for (var i = 0; i < count; i++) {
            $('#title').append('<div id="star_' + starId + '"><span class="Plus">+</span><span class="Shadow"></span></div>');

            var plus = $('#star_' + starId + ' .Plus');
            var shadow = $('#star_' + starId + ' .Shadow');

            //-10到200
            var r_left = Math.floor(Math.random() * $('#title').width()) - 10;
            //-30到20
            var r_top = Math.floor(Math.random() * 50) - 30;

            plus.css('left', r_left + 'px');
            shadow.css('left', (r_left + 4) + 'px');
            plus.css('top', r_top + 'px');
            shadow.css('top', (r_top + 3) + 'px');

            var r_transX = Math.floor(Math.random() * 60) - 30;
            var r_transY = Math.floor(Math.random() * 40) - 60;

            shadow.on('webkitTransitionEnd', function () {
                $(this).parent().remove();
            });

            //移动，旋转，清晰
            $('#star_' + starId + ' .Plus').css({ 'transform': 'translate(' + r_transX + 'px,' + r_transY + 'px) rotate(' + (i % 5 * 360) + 'deg)', 'opacity': '0.7' });
            //移动，闪烁（Y轴3D转换）
            $('#star_' + starId + ' .Shadow').css({ 'transform': 'translate(' + r_transX + 'px,' + r_transY + 'px) rotateY(' + (i % 5 * 360) + 'deg)' });

            //            setTimeout("$('#star_" + starId + " .Plus').css('transform', 'translate(" + r_transX + "px," + r_transY + "px)'); " +
            //                                    "$('#star_" + starId + " .Shadow').css('transform', 'translate(" + r_transX + "px," + r_transY + "px)'); ", 0);

            starId++;
        }
    });
}

//初始化日历
function setCalender() {
    //清除以前今天的样式
    $('.DivToday').removeClass('DivToday');

    //移除所有1号的月份标志
    $('#calender span').remove();

    //清除上次击中的标记
    $('#calender div').removeClass('DivMark');

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1 + alter;
    var date = alter == 0 ? now.getDate() : '';
    //当前月1号是星期几
    var firstDay = new Date(year, month - 1).getDay();
    //当前月天数（下月的第0天的00:00:00即为本月的最后一天）
    var days = new Date(year, month, 0).getDate();
    //当前月的上月天数
    var lastDays = new Date(year, month - 1, 0).getDate();

    //当前月1号起始位置
    var startPosition = firstDay & 7;

    $('#year').html(new Date(year, month - 1).getFullYear()).append('年');
    $('#month').html(new Date(year, month - 1).getMonth() + 1).append('月');
    //当天样式
    if (alter == 0) {
        $('#calender li:eq(' + (date + firstDay - 1) + ') div').addClass('DivToday');

        //移除月份改变前此Div遗留的事件，确保当天不会有悬浮效果
        $('.DivToday').off('mouseover mouseout');
    }

    //每天的动画的随机数（整月统一）
    var r_animation = Math.floor(Math.random() * 10);

    for (var i = 0; i < 35; i++) {
        ///一、设置日历数据
        //上月数据
        if (i < startPosition)
            $('#calender li:eq(' + i + ') div').html(lastDays - startPosition + i + 1);

            //本月数据
        else if (i < days + startPosition) {
            $('#calender li:eq(' + i + ') div').html(i - firstDay + 1);

            //在当前月1号添加月份标志
            if (i == startPosition)
                $('#calender li:eq(' + i + ')').append('<span>' + numChinese[new Date(year, month - 1).getMonth()]['num'] + '月</span>');
        }

            //下月数据
        else {
            $('#calender li:eq(' + i + ') div').html(i - (days + startPosition) + 1);

            //在当前的下月1号添加月份标志
            if (i == days + startPosition)
                $('#calender li:eq(' + i + ')').append('<span>' + numChinese[new Date(year, month).getMonth()]['num'] + '月</span>');
        }

        ///二、设置日历每日的悬停背景色
        //传参绑定事件
        $('#calender li:eq(' + i + ') div:not(.DivToday)').on('mouseover', { 'n': Math.floor(Math.random() * 10) }, function (e) {
            $(this).css('background', colors[e.data.n % 10]['color']);
            //e.target等同于this
            //this.id可直接拿到元素的id，或者$(this).attr('id');
            //$(this).attr('name')拿到元素的name
        });

        $('#calender li:eq(' + i + ') div:not(.DivToday)').on('mouseout', function () {
            //动态添加的样式优先级较高，会覆盖css文件里的静态样式
            //$(this).css('background', 'rgba(251,251,251,0.35)');

            //这里只需要清楚掉动态样式就行了，会显示出静态样式
            $(this).css('background', '');
        });

        ///三、初始化每日天气小图片
        var r = Math.floor(Math.random() * 10);

        /////图片会缓存起来，改变src不会再重新请求服务器
        $('#calender li:eq(' + i + ') img').attr('src', '../weather/' + weathers[r]['weather'] + '.png');
        $('#calender li:eq(' + i + ') img').parent().on('mousedown', function () {
            //动态绑定天气小图片动画
            $(this).children('img').css('animation', 'weather-move 1.2s ease-out');
        });

        //动画结束时监听事件（有别名）
        $('#calender li:eq(' + i + ') img').on('webkitAnimationEnd', function () {
            /////清除动画样式，下次赋给动画样式时才能触发动画，否则动画只播放一次
            $(this).css('animation', '');
        });

        ///四、加载每天的动画（第一次进入页面不加载，难看）
        if (!isInitial) {
            var serialNumber = direction == 'left' ? i : 34 - i;
            //统一的动画
            $('#calender li:eq(' + serialNumber + ')').css('animation', animations[r_animation]['animation'] + ' 1s ' + i / 50 + 's ease-out');

            //不统一的动画
            //$('#calender li:eq(' + serialNumber + ')').css('animation', animations[Math.floor(Math.random() * 10)]['animation'] + ' 1s ' + i / 50 + 's ease-out');

            $('#calender li:eq(' + serialNumber + ')').on('webkitAnimationEnd', function () {
                $(this).css('animation', '');
            });
        }
    }
}

//初始化头部
function setHead() {
    //绑定点击头像发射子弹事件
    $('#icon').on('click', function () {
        //刚点击时提高保护层禁止再次点击
        $('#protect').css('z-index', 3);
        //阻止按钮的鼠标事件
        //$('#icon').css('pointer-events', 'none');

        //清除上次击中的标记
        $('#calender div').removeClass('DivMark');

        //产生1-35之间的一个数
        var count = Math.floor(Math.random() * 35) + 1;

        //产生5-15之间的一个数
        //var count = Math.floor(Math.random() * 11) + 5;
        var arr = new Array();
        for (var i = 0; i < count; i++) {
            //产生0-34之间的一个数
            //arr.push(Math.floor(Math.random() * 35));

            ///产生0-34之间的一个不重复的数
            if (i == 0)
                arr.push(Math.floor(Math.random() * 35));
            else {
                var isExist = false;
                var r;
                for (var j = 0; j < i; j++) {
                    if (j == 0)
                        r = Math.floor(Math.random() * 35);
                    if (arr[j] == r) {
                        isExist = true;
                        j = -1;
                    }
                }
                arr.push(r);
            }

            $('#icon').append('<a id="bullet_' + i + '"></a><img id="tail_' + i + '" src="../image/tail_yellow.png" />');

            //先绑定子弹发射完后事件
            $('#bullet_' + i + '').on('webkitTransitionEnd', { 'nth': i, 'isLast': (i < count - 1 ? false : true) }, function (e) {
                $('#bullet_' + e.data.nth + '').remove();
                $('#tail_' + e.data.nth + '').remove();

                //击出天气小图片
                $('#calender li:eq(' + arr[e.data.nth] + ')').trigger('mousedown');

                //添加击中标记
                var div = $('#calender li:eq(' + arr[e.data.nth] + ') div');
                if (!div.hasClass('DivMark'))
                    div.addClass('DivMark');

                //最后一个子弹发射完恢复按钮点击
                if (e.data.isLast)
                    $('#protect').css('z-index', 1);
                //恢复按钮的鼠标事件
                //$('#icon').css('pointer-events', 'auto');
            });

            //每颗子弹延迟不同的时间发射
            $('#bullet_' + i + '').css('-webkit-transition-delay', i / 10 + 's');
            $('#tail_' + i + '').css('-webkit-transition-delay', i / 10 + 's');

            //开始发射
            var li = $('#calender li:eq(' + arr[i] + ')')[0];
            $('#bullet_' + i + '').css({ 'left': li.offsetLeft + 'px', 'top': li.offsetTop + 'px' });

            //尾巴旋转和偏移
            $('#tail_' + i + '').css({ 'transform-origin': '4.5px 4.5px', 'transform': 'rotate(' + (90 - getAngle(li.offsetLeft, li.offsetTop)) + 'deg) translateX(4.5px)' });

            //尾巴开始跟随，变宽，变高
            $('#tail_' + i + '').css({ 'width': getEdge(li.offsetLeft, li.offsetTop) / 3 + 'px', 'left': li.offsetLeft * 2 / 3 + 'px', 'top': li.offsetTop * 2 / 3 + 'px' });

            //击中动画（在子弹结束后0.1秒开始）
            $('#calender li:eq(' + arr[i] + ')').css('animation', animations[Math.floor(Math.random() * 10)]['animation'] + ' 1s ' + (0.6 + i / 10) + 's ease-out');

            $('#calender li:eq(' + arr[i] + ')').on('webkitAnimationEnd', function () {
                $(this).css('animation', '');
            });
        }
    });

    //上一月
    $('#previousMonth').on('click', function () {
        --alter;
        direction = 'left';
        isInitial = false;
        setCalender();
    });

    //下一月
    $('#nextMonth').on('click', function () {
        ++alter;
        direction = 'right';
        isInitial = false;
        setCalender();
    });

    //今天
    $('#today').on('click', function () {
        alter = 0;
        setCalender();
    });
}

//初始化播放列表
function setPlaylist() {
    //加载播放列表
    var musics = '';
    var as = '';
    for (var i = 0; i < 63; i++) {
        as += '<a class="Root2"></a>';
    }

    var count = playlist.length;
    for (var i = 0; i < count; i++) {
        musics += '<li><input type="button" onclick="playThis(' + i + ');" /><span>' + playlist[i]['title'] + '</span></li>';
    }

    $('#list').html(musics);
}

//换音乐
function playNew() {
    audios[0].src = '../music/' + playlist[no]['title'] + '.mp3';

    //重新滚动marquee
    marquees.parent().html('<marquee scrollamount="1">' + playlist[no]['title'] + ' -- ' + playlist[no]['artist'] + '</marquee>');
    marquees = $('marquee');
}

//点击播放列表按钮
function playThis(i) {
    no = i;

    playNew();

    changeImg();

    //动态绑定播放按钮动画
    $(event.target).css('animation', 'music-play 1s ease-out');

    //结束时清除动画样式，下次赋给动画样式时才能触发动画，否则动画只播放一次
    $(event.target).on('webkitAnimationEnd', function () {
        $(this).css('animation', '');
    });
}

//换日历背景图
function changeImg() {
    var r = Math.floor(Math.random() * 10);
    $('#calender').css('background', 'url(../cover/' + r + '.jpg) no-repeat center');
    $('#calender').css('background-size', '120% 100%');
}

//换播放按钮阴影图案
function changeFlower() {
    if (!isFlower) {
        $('#play').css('box-shadow', '12px -10px 1px rgba(100%,0%,0%,0.4),2px 10px 1px rgba(0%,100%,0%,0.4),-12px -8px 1px rgba(0%,0%,100%,0.4)');
        isFlower = true;
    }
    else {
        $('#play').css('box-shadow', '8px 24px 1px rgba(100%,0%,0%,0.4),16px -4px 1px rgba(0%,100%,0%,0.4),24px 12px 1px rgba(0%,0%,100%,0.4)');
        isFlower = false;
    }
}

function timeFormat(seconds) {
    var m = digit2(Math.floor(seconds / 60));
    var s = digit2(Math.floor(seconds % 60));

    return m + ':' + s;
}

function digit2(data) {
    return (data < 10 ? ('0' + data) : data);
}

//获取直角三角形中较小的角（y比x长）
function getAngle(x, y) {
    var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    var cos = y / z;
    var radina = Math.acos(cos);
    var angle = 180 / (Math.PI / radina);
    return angle;
}

//获取直角三角形的斜边
function getEdge(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}