/**
 * 音频管理器
 * 负责管理游戏中的所有音频播放，包括背景音乐和音效
 */
class AudioManager {
  constructor() {
    this.assetManager = null;
    this.context = null;
    this.masterVolume = 1.0;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.currentMusic = null;
    this.musicGainNode = null;
    this.sfxGainNode = null;
    this.isMuted = false;
    this.isInitialized = false;

    // 音频缓存
    this.audioBuffers = new Map();
    this.audioSources = new Map();

    // 音频配置
    this.config = {
      fadeTime: 1000, // 淡入淡出时间（毫秒）
      crossfadeTime: 2000, // 音乐切换时间（毫秒）
      maxSimultaneousSFX: 10, // 最大同时播放音效数量
    };

    // 当前播放的音效
    this.activeSFX = new Set();

    this._initAudioContext();
  }

  /**
   * 初始化音频管理器
   * @param {AssetManager} assetManager - 资源管理器实例
   */
  init(assetManager) {
    this.assetManager = assetManager;
  }

  /**
   * 初始化音频上下文
   * @private
   */
  _initAudioContext() {
    try {
      // 创建音频上下文
      this.context = new (window.AudioContext || window.webkitAudioContext)();

      // 创建主音量控制节点
      this.masterGainNode = this.context.createGain();
      this.masterGainNode.connect(this.context.destination);

      // 创建音乐和音效的独立音量控制节点
      this.musicGainNode = this.context.createGain();
      this.sfxGainNode = this.context.createGain();

      this.musicGainNode.connect(this.masterGainNode);
      this.sfxGainNode.connect(this.masterGainNode);

      this._updateVolumes();
      this.isInitialized = true;
    } catch (error) {
      console.warn('音频上下文初始化失败:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 恢复音频上下文（解决浏览器自动播放限制）
   */
  async resumeContext() {
    if (this.context && this.context.state === 'suspended') {
      try {
        await this.context.resume();
        return true;
      } catch (error) {
        console.warn('音频上下文恢复失败:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * 设置主音量
   * @param {number} volume - 音量 (0-1)
   */
  setMasterVolume(volume) {
    this.masterVolume = MathUtils.clamp(volume, 0, 1);
    this._updateVolumes();
  }

  /**
   * 设置音乐音量
   * @param {number} volume - 音量 (0-1)
   */
  setMusicVolume(volume) {
    this.musicVolume = MathUtils.clamp(volume, 0, 1);
    this._updateVolumes();
  }

  /**
   * 设置音效音量
   * @param {number} volume - 音量 (0-1)
   */
  setSFXVolume(volume) {
    this.sfxVolume = MathUtils.clamp(volume, 0, 1);
    this._updateVolumes();
  }

  /**
   * 静音/取消静音
   * @param {boolean} mute - 是否静音
   */
  setMuted(mute) {
    this.isMuted = mute;
    this._updateVolumes();
  }

  /**
   * 切换静音状态
   */
  toggleMute() {
    this.setMuted(!this.isMuted);
  }

  /**
   * 播放背景音乐
   * @param {string} audioName - 音频名称
   * @param {boolean} loop - 是否循环
   * @param {number} volume - 音量 (0-1)
   */
  async playMusic(audioName, loop = true, volume = null) {
    if (!this.isInitialized) {
      console.warn('音频管理器未初始化');
      return;
    }

    await this.resumeContext();

    const audio = this.assetManager.getAudio(audioName);
    if (!audio) {
      console.warn(`音频未找到: ${audioName}`);
      return;
    }

    // 停止当前音乐
    if (this.currentMusic) {
      this.stopMusic();
    }

    // 设置音量
    const musicVolume = volume !== null ? volume : this.musicVolume;
    audio.volume = this.isMuted ? 0 : musicVolume;
    audio.loop = loop;

    // 播放音乐
    try {
      await audio.play();
      this.currentMusic = audio;
    } catch (error) {
      console.warn(`音乐播放失败: ${audioName}`, error);
    }
  }

  /**
   * 停止当前音乐
   * @param {boolean} fadeOut - 是否淡出
   */
  stopMusic(fadeOut = true) {
    if (!this.currentMusic) return;

    if (fadeOut) {
      this._fadeOutMusic();
    } else {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * 暂停当前音乐
   */
  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  /**
   * 恢复当前音乐
   */
  resumeMusic() {
    if (this.currentMusic) {
      this.currentMusic.play().catch(e => console.warn('音乐恢复播放失败:', e));
    }
  }

  /**
   * 播放音效
   * @param {string} audioName - 音频名称
   * @param {number} volume - 音量 (0-1)
   * @param {number} playbackRate - 播放速率
   * @returns {Promise} 播放完成的Promise
   */
  async playSFX(audioName, volume = null, playbackRate = 1.0) {
    if (!this.isInitialized) {
      console.warn('音频管理器未初始化');
      return;
    }

    await this.resumeContext();

    const audio = this.assetManager.getAudio(audioName);
    if (!audio) {
      console.warn(`音效未找到: ${audioName}`);
      return;
    }

    // 限制同时播放的音效数量
    if (this.activeSFX.size >= this.config.maxSimultaneousSFX) {
      // 停止最早播放的音效
      const oldestSFX = this.activeSFX.values().next().value;
      if (oldestSFX) {
        oldestSFX.pause();
        this.activeSFX.delete(oldestSFX);
      }
    }

    // 创建音频副本以支持同时播放
    const audioClone = audio.cloneNode();

    // 设置音量
    const sfxVolume = volume !== null ? volume : this.sfxVolume;
    audioClone.volume = this.isMuted ? 0 : sfxVolume;
    audioClone.playbackRate = playbackRate;

    // 添加到活跃音效集合
    this.activeSFX.add(audioClone);

    // 播放音效
    try {
      await audioClone.play();

      // 播放完成后从活跃集合中移除
      audioClone.addEventListener('ended', () => {
        this.activeSFX.delete(audioClone);
      });
    } catch (error) {
      console.warn(`音效播放失败: ${audioName}`, error);
      this.activeSFX.delete(audioClone);
    }
  }

  /**
   * 停止所有音效
   */
  stopAllSFX() {
    this.activeSFX.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeSFX.clear();
  }

  /**
   * 播放3D音效（立体声效果）
   * @param {string} audioName - 音频名称
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} listenerX - 监听器x坐标
   * @param {number} listenerY - 监听器y坐标
   * @param {number} maxDistance - 最大距离
   */
  async playPositionalSFX(audioName, x, y, listenerX, listenerY, maxDistance = 200) {
    if (!this.isInitialized) return;

    // 计算距离和音量衰减
    const distance = MathUtils.distance(x, y, listenerX, listenerY);
    const volume = Math.max(0, 1 - distance / maxDistance);

    // 计算立体声位置（-1左，0中，1右）
    const pan = MathUtils.clamp((x - listenerX) / maxDistance, -1, 1);

    await this.playSFX(audioName, volume);
  }

  /**
   * 淡入音乐
   * @param {number} duration - 淡入时间（毫秒）
   */
  fadeInMusic(duration = null) {
    if (!this.currentMusic || !this.context) return;

    const fadeDuration = duration || this.config.fadeTime;
    const targetVolume = this.musicVolume;

    this.musicGainNode.gain.setValueAtTime(0, this.context.currentTime);
    this.musicGainNode.gain.linearRampToValueAtTime(
      targetVolume,
      this.context.currentTime + fadeDuration / 1000
    );
  }

  /**
   * 淡出音乐
   * @param {number} duration - 淡出时间（毫秒）
   */
  fadeOutMusic(duration = null) {
    if (!this.currentMusic || !this.context) return;

    const fadeDuration = duration || this.config.fadeTime;

    this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, this.context.currentTime);
    this.musicGainNode.gain.linearRampToValueAtTime(
      0,
      this.context.currentTime + fadeDuration / 1000
    );

    // 淡出完成后停止音乐
    setTimeout(() => {
      if (this.currentMusic) {
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
        this.currentMusic = null;
      }
    }, fadeDuration);
  }

  /**
   * 交叉淡化切换音乐
   * @param {string} newAudioName - 新音乐名称
   * @param {boolean} loop - 是否循环
   */
  async crossfadeMusic(newAudioName, loop = true) {
    if (!this.isInitialized) return;

    const oldMusic = this.currentMusic;

    // 播放新音乐
    await this.playMusic(newAudioName, loop);
    const newMusic = this.currentMusic;

    if (oldMusic && newMusic) {
      // 交叉淡化
      const crossfadeTime = this.config.crossfadeTime / 1000;
      const currentTime = this.context.currentTime;

      // 旧音乐淡出
      this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, currentTime);
      this.musicGainNode.gain.linearRampToValueAtTime(0, currentTime + crossfadeTime);

      // 新音乐淡入
      setTimeout(() => {
        if (newMusic && this.musicGainNode) {
          this.musicGainNode.gain.setValueAtTime(0, this.context.currentTime);
          this.musicGainNode.gain.linearRampToValueAtTime(
            this.musicVolume,
            this.context.currentTime + crossfadeTime
          );
        }
      }, 50);

      // 停止旧音乐
      setTimeout(() => {
        if (oldMusic) {
          oldMusic.pause();
          oldMusic.currentTime = 0;
        }
      }, this.config.crossfadeTime);
    }
  }

  /**
   * 获取当前音乐状态
   * @returns {Object} 音乐状态信息
   */
  getMusicStatus() {
    return {
      isPlaying: this.currentMusic && !this.currentMusic.paused,
      currentTime: this.currentMusic ? this.currentMusic.currentTime : 0,
      duration: this.currentMusic ? this.currentMusic.duration : 0,
      volume: this.musicVolume,
      isMuted: this.isMuted,
    };
  }

  /**
   * 设置播放位置（仅对HTML5音频有效）
   * @param {number} time - 时间位置（秒）
   */
  setMusicPosition(time) {
    if (this.currentMusic) {
      this.currentMusic.currentTime = time;
    }
  }

  /**
   * 更新音量设置
   * @private
   */
  _updateVolumes() {
    const masterVolume = this.isMuted ? 0 : this.masterVolume;

    if (this.masterGainNode) {
      this.masterGainNode.gain.value = masterVolume;
    }

    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume;
    }

    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume;
    }
  }

  /**
   * 淡出当前音乐
   * @private
   */
  _fadeOutMusic() {
    if (!this.currentMusic || !this.context) return;

    const fadeDuration = this.config.fadeTime;
    const currentTime = this.context.currentTime;

    this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, currentTime);
    this.musicGainNode.gain.linearRampToValueAtTime(0, currentTime + fadeDuration / 1000);

    setTimeout(() => {
      if (this.currentMusic) {
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
        this.currentMusic = null;
      }
    }, fadeDuration);
  }

  /**
   * 销毁音频管理器
   */
  destroy() {
    this.stopMusic(false);
    this.stopAllSFX();

    if (this.context) {
      this.context.close();
      this.context = null;
    }

    this.audioBuffers.clear();
    this.audioSources.clear();
    this.activeSFX.clear();
  }

  /**
   * 获取音频统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      activeSFXCount: this.activeSFX.size,
      currentMusic: this.currentMusic ? 'playing' : 'stopped',
      contextState: this.context ? this.context.state : 'none',
    };
  }
}

module.exports = AudioManager;
