/**
 * 字符串工具类
 * 提供字符串处理的常用函数
 */
class StringUtils {
  /**
   * 首字母大写
   * @param {string} str - 输入字符串
   * @returns {string} 首字母大写的字符串
   */
  static capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * 驼峰命名转短横线命名
   * @param {string} str - 驼峰命名字符串
   * @returns {string} 短横线命名字符串
   */
  static camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * 短横线命名转驼峰命名
   * @param {string} str - 短横线命名字符串
   * @returns {string} 驼峰命名字符串
   */
  static kebabToCamel(str) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
  }

  /**
   * 字符串截断
   * @param {string} str - 输入字符串
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀，默认"..."
   * @returns {string} 截断后的字符串
   */
  static truncate(str, maxLength, suffix = '...') {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 字符串填充
   * @param {string} str - 输入字符串
   * @param {number} length - 目标长度
   * @param {string} padStr - 填充字符
   * @param {boolean} padStart - 是否在前面填充
   * @returns {string} 填充后的字符串
   */
  static pad(str, length, padStr = ' ', padStart = true) {
    str = String(str);
    if (str.length >= length) return str;

    const padLength = length - str.length;
    const padString = padStr.repeat(Math.ceil(padLength / padStr.length)).substring(0, padLength);

    return padStart ? padString + str : str + padString;
  }

  /**
   * 移除字符串两端的空白字符
   * @param {string} str - 输入字符串
   * @returns {string} 去除空白后的字符串
   */
  static trim(str) {
    return str.trim();
  }

  /**
   * 移除字符串左端的空白字符
   * @param {string} str - 输入字符串
   * @returns {string} 去除空白后的字符串
   */
  static trimStart(str) {
    return str.replace(/^\s+/, '');
  }

  /**
   * 移除字符串右端的空白字符
   * @param {string} str - 输入字符串
   * @returns {string} 去除空白后的字符串
   */
  static trimEnd(str) {
    return str.replace(/\s+$/, '');
  }

  /**
   * 检查字符串是否以指定前缀开头
   * @param {string} str - 输入字符串
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否以指定前缀开头
   */
  static startsWith(str, prefix) {
    return str.startsWith(prefix);
  }

  /**
   * 检查字符串是否以指定后缀结尾
   * @param {string} str - 输入字符串
   * @param {string} suffix - 后缀
   * @returns {boolean} 是否以指定后缀结尾
   */
  static endsWith(str, suffix) {
    return str.endsWith(suffix);
  }

  /**
   * 检查字符串是否包含指定子字符串
   * @param {string} str - 输入字符串
   * @param {string} searchStr - 搜索字符串
   * @returns {boolean} 是否包含
   */
  static includes(str, searchStr) {
    return str.includes(searchStr);
  }

  /**
   * 字符串替换（支持正则表达式）
   * @param {string} str - 输入字符串
   * @param {string|RegExp} searchValue - 搜索值
   * @param {string|Function} replaceValue - 替换值
   * @returns {string} 替换后的字符串
   */
  static replace(str, searchValue, replaceValue) {
    return str.replace(searchValue, replaceValue);
  }

  /**
   * 字符串分割
   * @param {string} str - 输入字符串
   * @param {string|RegExp} separator - 分隔符
   * @param {number} limit - 限制分割次数
   * @returns {Array} 分割后的字符串数组
   */
  static split(str, separator, limit) {
    return str.split(separator, limit);
  }

  /**
   * 字符串连接
   * @param {Array} strings - 字符串数组
   * @param {string} separator - 分隔符
   * @returns {string} 连接后的字符串
   */
  static join(strings, separator = ',') {
    return strings.join(separator);
  }

  /**
   * 字符串重复
   * @param {string} str - 输入字符串
   * @param {number} count - 重复次数
   * @returns {string} 重复后的字符串
   */
  static repeat(str, count) {
    return str.repeat(count);
  }

  /**
   * 字符串反转
   * @param {string} str - 输入字符串
   * @returns {string} 反转后的字符串
   */
  static reverse(str) {
    return str.split('').reverse().join('');
  }

  /**
   * 字符串转大写
   * @param {string} str - 输入字符串
   * @returns {string} 大写字符串
   */
  static toUpperCase(str) {
    return str.toUpperCase();
  }

  /**
   * 字符串转小写
   * @param {string} str - 输入字符串
   * @returns {string} 小写字符串
   */
  static toLowerCase(str) {
    return str.toLowerCase();
  }

  /**
   * 字符串转标题格式（每个单词首字母大写）
   * @param {string} str - 输入字符串
   * @returns {string} 标题格式字符串
   */
  static toTitleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  /**
   * 生成随机字符串
   * @param {number} length - 字符串长度
   * @param {string} chars - 可用字符集
   * @returns {string} 随机字符串
   */
  static random(length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 字符串转数字
   * @param {string} str - 输入字符串
   * @param {number} defaultValue - 默认值
   * @returns {number} 转换后的数字
   */
  static toNumber(str, defaultValue = 0) {
    const num = parseFloat(str);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * 字符串转整数
   * @param {string} str - 输入字符串
   * @param {number} defaultValue - 默认值
   * @returns {number} 转换后的整数
   */
  static toInt(str, defaultValue = 0) {
    const num = parseInt(str, 10);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * 字符串转布尔值
   * @param {string} str - 输入字符串
   * @returns {boolean} 转换后的布尔值
   */
  static toBoolean(str) {
    if (typeof str === 'boolean') return str;
    if (typeof str === 'string') {
      const lowerStr = str.toLowerCase();
      return lowerStr === 'true' || lowerStr === '1' || lowerStr === 'yes' || lowerStr === 'on';
    }
    return Boolean(str);
  }

  /**
   * 格式化字符串（类似printf）
   * @param {string} format - 格式字符串
   * @param {...any} args - 参数
   * @returns {string} 格式化后的字符串
   */
  static format(format, ...args) {
    return format.replace(/%([sdifo])/g, (match, type) => {
      const arg = args.shift();
      switch (type) {
      case 's':
        return String(arg);
      case 'd':
        return Math.floor(arg);
      case 'i':
        return Math.floor(arg);
      case 'f':
        return parseFloat(arg).toFixed(2);
      case 'o':
        return JSON.stringify(arg);
      default:
        return match;
      }
    });
  }

  /**
   * 检查字符串是否为空或只包含空白字符
   * @param {string} str - 输入字符串
   * @returns {boolean} 是否为空
   */
  static isEmpty(str) {
    return !str || StringUtils.trim(str).length === 0;
  }

  /**
   * 检查字符串是否为空白字符串
   * @param {string} str - 输入字符串
   * @returns {boolean} 是否为空白
   */
  static isBlank(str) {
    return StringUtils.isEmpty(str);
  }

  /**
   * 字符串长度（支持Unicode）
   * @param {string} str - 输入字符串
   * @returns {number} 字符串长度
   */
  static length(str) {
    return [...str].length;
  }

  /**
   * 获取子字符串（支持Unicode）
   * @param {string} str - 输入字符串
   * @param {number} start - 起始位置
   * @param {number} end - 结束位置
   * @returns {string} 子字符串
   */
  static substring(str, start, end) {
    return [...str].slice(start, end).join('');
  }
}

window.StringUtils = StringUtils;
