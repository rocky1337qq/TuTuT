// Компонент интерактивного выбора дат заезда и выезда
// Поддерживает подсветку занятых дат, диапазон бронирования и автоопределение текущего месяца

class DatePicker {
  constructor(options = {}) {
    this.checkinInputId = options.checkinInputId || 'checkinInput';
    this.checkoutInputId = options.checkoutInputId || 'checkoutInput';
    this.containerId = options.containerId;
    this.bookedDates = options.bookedDates || []; // [{checkin: 'YYYY-MM-DD', checkout: 'YYYY-MM-DD'}]
    this.onSelect = options.onSelect || function() {};

    // Текущая дата пользователя
    const today = new Date();
    this.today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Месяц для отображения — сразу тот, с которого зашел пользователь
    this.viewYear = this.today.getFullYear();
    this.viewMonth = this.today.getMonth();

    this.checkinDate = options.initialCheckin ? new Date(options.initialCheckin) : null;
    this.checkoutDate = options.initialCheckout ? new Date(options.initialCheckout) : null;
    this.activeField = 'checkin'; // 'checkin' или 'checkout'
    this.isOpen = false;

    this.monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    this.dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    this.init();
  }

  setBookedDates(bookedDates) {
    this.bookedDates = bookedDates || [];
    if (this.isOpen) this.renderCalendar();
  }

  init() {
    this.checkinInput = document.getElementById(this.checkinInputId);
    this.checkoutInput = document.getElementById(this.checkoutInputId);
    if (!this.checkinInput || !this.checkoutInput) return;

    // Скрытые поля с форматом YYYY-MM-DD для форм
    this.ensureHiddenInputs();

    // Создаем контейнер календаря
    this.createPopup();

    // Слушатели кликов
    this.checkinInput.addEventListener('click', (e) => {
      e.stopPropagation();
      this.activeField = 'checkin';
      this.open();
    });

    this.checkoutInput.addEventListener('click', (e) => {
      e.stopPropagation();
      this.activeField = 'checkout';
      this.open();
    });

    document.addEventListener('click', (e) => {
      if (this.popup && !this.popup.contains(e.target) && 
          e.target !== this.checkinInput && e.target !== this.checkoutInput) {
        this.close();
      }
    });

    // Первоначальное форматирование если даты переданы
    if (this.checkinDate) this.updateInputDisplay('checkin', this.checkinDate);
    if (this.checkoutDate) this.updateInputDisplay('checkout', this.checkoutDate);
  }

  ensureHiddenInputs() {
    let checkinVal = this.checkinInput.value;
    let checkoutVal = this.checkoutInput.value;

    if (checkinVal && /^\d{4}-\d{2}-\d{2}$/.test(checkinVal)) {
      this.checkinDate = new Date(checkinVal + 'T00:00:00');
    }
    if (checkoutVal && /^\d{4}-\d{2}-\d{2}$/.test(checkoutVal)) {
      this.checkoutDate = new Date(checkoutVal + 'T00:00:00');
    }
  }

  createPopup() {
    this.popup = document.createElement('div');
    this.popup.className = 'dc-datepicker-popup';
    this.popup.style.display = 'none';
    document.body.appendChild(this.popup);
  }

  open() {
    this.isOpen = true;
    this.renderCalendar();
    this.positionPopup();
    this.popup.style.display = 'block';
  }

  close() {
    this.isOpen = false;
    if (this.popup) this.popup.style.display = 'none';
  }

  positionPopup() {
    const targetInput = this.activeField === 'checkout' ? this.checkoutInput : this.checkinInput;
    const rect = targetInput.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = rect.bottom + scrollTop + 6;
    let left = rect.left + scrollLeft;

    // Проверка выхода за правый край экрана
    if (left + 320 > window.innerWidth) {
      left = window.innerWidth - 330;
    }
    if (left < 10) left = 10;

    this.popup.style.top = `${top}px`;
    this.popup.style.left = `${left}px`;
  }

  formatDateIso(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatDateRu(date) {
    if (!date) return '';
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  isDateBooked(date) {
    const dateStr = this.formatDateIso(date);
    for (let b of this.bookedDates) {
      if (dateStr >= b.checkin && dateStr < b.checkout) {
        return true;
      }
    }
    return false;
  }

  renderCalendar() {
    const year = this.viewYear;
    const month = this.viewMonth;

    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    // День недели (0 - вс, переводим в 0 - пн)
    let startDayOfWeek = (firstDay.getDay() + 6) % 7;
    // Количество дней в текущем месяце
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Проверка возможности перейти назад (нельзя раньше текущего месяца)
    const canGoPrev = (year > this.today.getFullYear()) || 
                      (year === this.today.getFullYear() && month > this.today.getMonth());

    let html = `
      <div class="dc-dp-header">
        <button type="button" class="dc-dp-nav-btn prev-btn" ${!canGoPrev ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="dc-dp-title">${this.monthNames[month]} ${year}</div>
        <button type="button" class="dc-dp-nav-btn next-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="dc-dp-weekdays">
        ${this.dayNames.map(d => `<span class="dc-dp-weekday">${d}</span>`).join('')}
      </div>

      <div class="dc-dp-grid">
    `;

    // Пустые ячейки до начала месяца
    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="dc-dp-cell empty"></div>`;
    }

    // Дни месяца
    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      const isPast = current < this.today;
      const isBooked = this.isDateBooked(current);

      const isCheckin = this.checkinDate && this.formatDateIso(current) === this.formatDateIso(this.checkinDate);
      const isCheckout = this.checkoutDate && this.formatDateIso(current) === this.formatDateIso(this.checkoutDate);
      const isInRange = this.checkinDate && this.checkoutDate && 
                        current > this.checkinDate && current < this.checkoutDate;

      let classes = ['dc-dp-cell'];
      let disabled = false;

      if (isPast) {
        classes.push('past');
        disabled = true;
      } else if (isBooked) {
        classes.push('booked');
        disabled = true;
      }

      if (isCheckin) classes.push('selected-checkin');
      if (isCheckout) classes.push('selected-checkout');
      if (isInRange) classes.push('in-range');

      const titleAttr = isBooked ? 'title="Дата уже занята"' : '';
      const dayData = this.formatDateIso(current);

      html += `
        <button type="button" class="${classes.join(' ')}" data-date="${dayData}" ${disabled ? 'disabled' : ''} ${titleAttr}>
          ${d}
          ${isBooked ? '<span class="dc-dp-booked-dot"></span>' : ''}
        </button>
      `;
    }

    html += `</div>`;

    // Футер с подсказкой и легендой
    html += `
      <div class="dc-dp-footer">
        <div class="dc-dp-legend">
          <span class="legend-item"><span class="dot free"></span>Свободно</span>
          <span class="legend-item"><span class="dot booked"></span>Занято</span>
        </div>
        <div class="dc-dp-status">
          ${this.activeField === 'checkin' ? 'Выберите дату заезда' : 'Выберите дату выезда'}
        </div>
      </div>
    `;

    this.popup.innerHTML = html;

    // Слушатели кнопок навигации
    this.popup.querySelector('.prev-btn').onclick = (e) => {
      e.stopPropagation();
      if (!canGoPrev) return;
      this.viewMonth--;
      if (this.viewMonth < 0) {
        this.viewMonth = 11;
        this.viewYear--;
      }
      this.renderCalendar();
    };

    this.popup.querySelector('.next-btn').onclick = (e) => {
      e.stopPropagation();
      this.viewMonth++;
      if (this.viewMonth > 11) {
        this.viewMonth = 0;
        this.viewYear++;
      }
      this.renderCalendar();
    };

    // Слушатели выбора дней
    this.popup.querySelectorAll('.dc-dp-cell:not(.empty):not([disabled])').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const dateStr = btn.dataset.date;
        this.selectDate(new Date(dateStr + 'T00:00:00'));
      };
    });
  }

  selectDate(date) {
    if (this.activeField === 'checkin') {
      this.checkinDate = date;
      this.updateInputDisplay('checkin', date);

      // Если дата выезда раньше заезда или совпадает — сбрасываем её
      if (this.checkoutDate && this.checkoutDate <= date) {
        this.checkoutDate = null;
        this.updateInputDisplay('checkout', null);
      }

      // Автоматически переключаем на выбор даты выезда
      this.activeField = 'checkout';
      this.renderCalendar();
    } else {
      // Выбор даты выезда
      if (this.checkinDate && date <= this.checkinDate) {
        // Если выбрали дату раньше заезда, делаем её новым заездом
        this.checkinDate = date;
        this.updateInputDisplay('checkin', date);
        this.renderCalendar();
        return;
      }

      // Проверка: нет ли занятых дней внутри выбранного диапазона
      let hasBookedInRange = false;
      if (this.checkinDate) {
        for (let d = new Date(this.checkinDate); d < date; d.setDate(d.getDate() + 1)) {
          if (this.isDateBooked(d)) {
            hasBookedInRange = true;
            break;
          }
        }
      }

      if (hasBookedInRange) {
        alert('Внутри выбранного диапазона есть уже занятые даты. Пожалуйста, выберите свободный интервал.');
        return;
      }

      this.checkoutDate = date;
      this.updateInputDisplay('checkout', date);
      this.close();

      if (this.onSelect) {
        this.onSelect(this.formatDateIso(this.checkinDate), this.formatDateIso(this.checkoutDate));
      }
    }
  }

  updateInputDisplay(field, date) {
    const input = field === 'checkin' ? this.checkinInput : this.checkoutInput;
    if (!input) return;

    if (date) {
      input.value = this.formatDateIso(date);
      input.dataset.formatted = this.formatDateRu(date);
    } else {
      input.value = '';
      input.dataset.formatted = '';
    }

    // Триггерим событие изменения
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
  }
}

window.DatePicker = DatePicker;
window.DomclickDatePicker = DatePicker;
