(function () {
/**
 * 存储工具类
 * 提供本地存储和会话存储的统一接口
 */
class StorageUtils {
  /**
   * 存储类型枚举
   */
  static STORAGE_TYPE = {
    LOCAL: 'localStorage',
    SESSION: 'sessionStorage',
  };

  /**
   * 默认存储前缀
   */
  static DEFAULT_PREFIX = 'diamond_frenzy_';

  /**
   * 存储数据
   * @param {string} key - 存储键
   * @param {any} value - 存储值
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   */
  static set(key, value, storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return false;

      const fullKey = prefix + key;
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        type: typeof value,
      });

      storage.setItem(fullKey, serializedValue);
      return true;
    } catch (error) {
      console.warn('Storage set failed:', error);
      return false;
    }
  }

  /**
   * 获取存储数据
   * @param {string} key - 存储键
   * @param {any} defaultValue - 默认值
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {any} 存储的值
   */
  static get(
    key,
    defaultValue = null,
    storageType = this.STORAGE_TYPE.LOCAL,
    prefix = this.DEFAULT_PREFIX
  ) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return defaultValue;

      const fullKey = prefix + key;
      const item = storage.getItem(fullKey);

      if (!item) return defaultValue;

      const parsed = JSON.parse(item);
      return parsed.data;
    } catch (error) {
      console.warn('Storage get failed:', error);
      return defaultValue;
    }
  }

  /**
   * 删除存储数据
   * @param {string} key - 存储键
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否删除成功
   */
  static remove(key, storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return false;

      const fullKey = prefix + key;
      storage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.warn('Storage remove failed:', error);
      return false;
    }
  }

  /**
   * 清空所有存储数据
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否清空成功
   */
  static clear(storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return false;

      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          storage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.warn('Storage clear failed:', error);
      return false;
    }
  }

  /**
   * 检查存储键是否存在
   * @param {string} key - 存储键
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否存在
   */
  static has(key, storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return false;

      const fullKey = prefix + key;
      return storage.getItem(fullKey) !== null;
    } catch (error) {
      console.warn('Storage has failed:', error);
      return false;
    }
  }

  /**
   * 获取所有存储键
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {Array} 存储键数组
   */
  static keys(storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return [];

      const keys = Object.keys(storage);
      return keys.filter(key => key.startsWith(prefix)).map(key => key.substring(prefix.length));
    } catch (error) {
      console.warn('Storage keys failed:', error);
      return [];
    }
  }

  /**
   * 获取存储使用情况
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {Object} 存储使用情况
   */
  static getUsage(storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return { used: 0, total: 0, percentage: 0 };

      let used = 0;
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          used += storage.getItem(key).length;
        }
      });

      // 估算总容量（不同浏览器有所不同）
      const total = storageType === this.STORAGE_TYPE.LOCAL ? 5 * 1024 * 1024 : 1024 * 1024; // 5MB for local, 1MB for session
      const percentage = (used / total) * 100;

      return { used, total, percentage: Math.round(percentage * 100) / 100 };
    } catch (error) {
      console.warn('Storage getUsage failed:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * 设置过期时间（仅对localStorage有效）
   * @param {string} key - 存储键
   * @param {any} value - 存储值
   * @param {number} expiryHours - 过期小时数
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否设置成功
   */
  static setWithExpiry(
    key,
    value,
    expiryHours = 24,
    storageType = this.STORAGE_TYPE.LOCAL,
    prefix = this.DEFAULT_PREFIX
  ) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return false;

      const fullKey = prefix + key;
      const expiryTime = Date.now() + expiryHours * 60 * 60 * 1000;

      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        expiry: expiryTime,
        type: typeof value,
      });

      storage.setItem(fullKey, serializedValue);
      return true;
    } catch (error) {
      console.warn('Storage setWithExpiry failed:', error);
      return false;
    }
  }

  /**
   * 获取带过期时间的数据
   * @param {string} key - 存储键
   * @param {any} defaultValue - 默认值
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {any} 存储的值
   */
  static getWithExpiry(
    key,
    defaultValue = null,
    storageType = this.STORAGE_TYPE.LOCAL,
    prefix = this.DEFAULT_PREFIX
  ) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return defaultValue;

      const fullKey = prefix + key;
      const item = storage.getItem(fullKey);

      if (!item) return defaultValue;

      const parsed = JSON.parse(item);

      // 检查是否过期
      if (parsed.expiry && Date.now() > parsed.expiry) {
        storage.removeItem(fullKey);
        return defaultValue;
      }

      return parsed.data;
    } catch (error) {
      console.warn('Storage getWithExpiry failed:', error);
      return defaultValue;
    }
  }

  /**
   * 压缩存储数据
   * @param {string} key - 存储键
   * @param {any} value - 存储值
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否存储成功
   */
  static setCompressed(
    key,
    value,
    storageType = this.STORAGE_TYPE.LOCAL,
    prefix = this.DEFAULT_PREFIX
  ) {
    try {
      // 简单的数据压缩（移除不必要的空白字符）
      const compressed =
        typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : JSON.stringify(value);

      return this.set(key, compressed, storageType, prefix);
    } catch (error) {
      console.warn('Storage setCompressed failed:', error);
      return false;
    }
  }

  /**
   * 批量存储
   * @param {Object} data - 键值对对象
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否全部存储成功
   */
  static setMultiple(data, storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    let success = true;
    for (const [key, value] of Object.entries(data)) {
      if (!this.set(key, value, storageType, prefix)) {
        success = false;
      }
    }
    return success;
  }

  /**
   * 批量获取
   * @param {Array} keys - 键数组
   * @param {Object} defaultValues - 默认值对象
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {Object} 键值对对象
   */
  static getMultiple(
    keys,
    defaultValues = {},
    storageType = this.STORAGE_TYPE.LOCAL,
    prefix = this.DEFAULT_PREFIX
  ) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.get(key, defaultValues[key], storageType, prefix);
    });
    return result;
  }

  /**
   * 导出存储数据
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {Object} 导出的数据对象
   */
  static export(storageType = this.STORAGE_TYPE.LOCAL, prefix = this.DEFAULT_PREFIX) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return {};

      const data = {};
      const keys = Object.keys(storage);
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          const shortKey = key.substring(prefix.length);
          try {
            const item = JSON.parse(storage.getItem(key));
            data[shortKey] = item.data;
          } catch (e) {
            data[shortKey] = storage.getItem(key);
          }
        }
      });
      return data;
    } catch (error) {
      console.warn('Storage export failed:', error);
      return {};
    }
  }

  /**
   * 导入存储数据
   * @param {Object} data - 数据对象
   * @param {boolean} overwrite - 是否覆盖现有数据
   * @param {string} storageType - 存储类型
   * @param {string} prefix - 前缀
   * @returns {boolean} 是否导入成功
   */
  static import(
    data,
    overwrite = false,
    storageType = this.STORAGE_TYPE.LOCAL,
    prefix = this.DEFAULT_PREFIX
  ) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return false;

      let success = true;
      for (const [key, value] of Object.entries(data)) {
        if (overwrite || !this.has(key, storageType, prefix)) {
          if (!this.set(key, value, storageType, prefix)) {
            success = false;
          }
        }
      }
      return success;
    } catch (error) {
      console.warn('Storage import failed:', error);
      return false;
    }
  }

  /**
   * 获取存储对象
   * @param {string} storageType - 存储类型
   * @returns {Storage|null} 存储对象
   * @private
   */
  static _getStorage(storageType) {
    try {
      switch (storageType) {
      case this.STORAGE_TYPE.LOCAL:
        return window.localStorage;
      case this.STORAGE_TYPE.SESSION:
        return window.sessionStorage;
      default:
        return null;
      }
    } catch (error) {
      console.warn('Storage not available:', error);
      return null;
    }
  }

  /**
   * 检查存储是否可用
   * @param {string} storageType - 存储类型
   * @returns {boolean} 是否可用
   */
  static isAvailable(storageType = this.STORAGE_TYPE.LOCAL) {
    try {
      const storage = this._getStorage(storageType);
      if (!storage) return false;

      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

window.StorageUtils = StorageUtils;
})();
