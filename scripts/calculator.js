import { siteConfig } from "./config.js";

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0
});

const els = {
  tariff: document.getElementById("tariff"),
  marketplace: document.getElementById("marketplace"),
  monthlyTurnover: document.getElementById("monthlyTurnover"),
  periodMonths: document.getElementById("periodMonths"),
  lossRate: document.getElementById("lossRate"),
  compensatedShare: document.getElementById("compensatedShare"),
  documentedShare: document.getElementById("documentedShare"),
  recoveryRate: document.getElementById("recoveryRate"),
  successFeeRate: document.getElementById("successFeeRate"),
  monitoringFee: document.getElementById("monitoringFee"),
  recommendedBadge: document.getElementById("recommendedBadge"),
  netBenefitValue: document.getElementById("netBenefitValue"),
  netBenefitLabel: document.getElementById("netBenefitLabel"),
  potentialLosses: document.getElementById("potentialLosses"),
  claimAmount: document.getElementById("claimAmount"),
  projectedReturn: document.getElementById("projectedReturn"),
  serviceCost: document.getElementById("serviceCost"),
  roiValue: document.getElementById("roiValue"),
  paybackValue: document.getElementById("paybackValue"),
  launchFormat: document.getElementById("launchFormat"),
  story1: document.getElementById("story1"),
  story2: document.getElementById("story2"),
  story3: document.getElementById("story3")
};

const yearEls = document.querySelectorAll("#currentYear");
yearEls.forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

const telegramLinks = document.querySelectorAll(".contact-telegram");
telegramLinks.forEach((link) => {
  link.href = siteConfig.telegramUrl;
  link.target = "_blank";
  link.rel = "noreferrer noopener";
});

const emailLinks = document.querySelectorAll(".contact-email");
emailLinks.forEach((link) => {
  link.href = `mailto:${siteConfig.email}`;
  link.textContent = siteConfig.email;
});

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fmtMoney(value) {
  return money.format(Math.round(value));
}

function fmtPct(value) {
  return `${percent.format(value)}%`;
}

function getTariffPreset(tariff) {
  if (tariff === "express") {
    return {
      fixed: 15000,
      success: 0,
      label: "Быстрый вход через экспресс-аудит",
      badge: "Рекомендуем для первичной проверки",
      netLabel: "Потенциал после входа в экспресс-аудит",
      projectedLabel: "Потенциал следующего возврата"
    };
  }

  if (tariff === "monitoring") {
    return {
      fixed: 0,
      success: 0,
      label: "Подписка на регулярный мониторинг",
      badge: "Рекомендуем для постоянного контроля",
      netLabel: "Чистая выгода за период мониторинга",
      projectedLabel: "Предотвращенные потери"
    };
  }

  if (tariff === "premium") {
    return {
      fixed: 100000,
      success: 15,
      label: "Premium для крупного и срочного кейса",
      badge: "Рекомендуем для крупного селлера",
      netLabel: "Чистая выгода после Premium запуска",
      projectedLabel: "Ожидаемая компенсация"
    };
  }

  return {
    fixed: 50000,
    success: 12,
    label: "Основной формат: глобальная сверка",
    badge: "Рекомендуемый тариф для большинства кейсов",
    netLabel: "Чистая прогнозная выгода после оплаты услуг",
    projectedLabel: "Ожидаемая компенсация"
  };
}

function getRecommendedTariff(monthlyTurnover, potentialLosses, periodMonths) {
  if (monthlyTurnover >= 10000000 || potentialLosses >= 5000000) return "premium";
  if (periodMonths >= 6 && monthlyTurnover >= 1500000) return "global";
  if (monthlyTurnover <= 1000000 && potentialLosses <= 250000) return "express";
  return "global";
}

function syncTariffControls() {
  const tariff = els.tariff.value;
  const preset = getTariffPreset(tariff);

  if (tariff === "express" || tariff === "monitoring") {
    els.successFeeRate.value = String(preset.success);
    els.successFeeRate.setAttribute("disabled", "disabled");
  } else {
    els.successFeeRate.removeAttribute("disabled");
    const current = num(els.successFeeRate.value, 0);
    if (current === 0) {
      els.successFeeRate.value = String(preset.success);
    }
  }
}

function setValueText(el, value) {
  if (el) el.textContent = value;
}

function setNetTone(value) {
  if (!els.netBenefitValue) return;
  els.netBenefitValue.classList.remove("text-positive", "text-warning", "text-danger");

  if (value > 0) {
    els.netBenefitValue.classList.add("text-positive");
  } else if (value > -100000) {
    els.netBenefitValue.classList.add("text-warning");
  } else {
    els.netBenefitValue.classList.add("text-danger");
  }
}

function render() {
  const tariff = els.tariff.value;
  const preset = getTariffPreset(tariff);

  const monthlyTurnover = Math.max(0, num(els.monthlyTurnover.value, 0));
  const periodMonths = clamp(Math.max(1, num(els.periodMonths.value, 12)), 1, 24);
  const lossRate = clamp(num(els.lossRate.value, 1.8), 0.1, 10);
  const compensatedShare = clamp(num(els.compensatedShare.value, 10), 0, 100);
  const documentedShare = clamp(num(els.documentedShare.value, 80), 10, 100);
  const recoveryRate = clamp(num(els.recoveryRate.value, 70), 10, 100);
  const successFeeRate = clamp(num(els.successFeeRate.value, preset.success), 0, 30);
  const monitoringFee = Math.max(0, num(els.monitoringFee.value, 20000));
  const marketplace = els.marketplace.value;

  const turnoverBase = monthlyTurnover * periodMonths;
  const potentialLosses = turnoverBase * (lossRate / 100);
  const afterCompensation = potentialLosses * (1 - compensatedShare / 100);
  const claimAmount = afterCompensation * (documentedShare / 100);
  const projectedReturn = claimAmount * (recoveryRate / 100);

  let serviceCost = preset.fixed;
  let netBenefit = projectedReturn - serviceCost;
  let roi = serviceCost > 0 ? (netBenefit / serviceCost) * 100 : 0;
  let paybackMonths = projectedReturn > 0 ? serviceCost / (projectedReturn / Math.max(periodMonths, 1)) : 0;
  let projectedLabel = preset.projectedLabel;
  let story3 = `Стоимость сервиса по выбранному тарифу составит ${fmtMoney(serviceCost)}, а чистый прогнозный эффект — ${fmtMoney(netBenefit)}.`;

  if (tariff === "global") {
    serviceCost = preset.fixed + projectedReturn * (successFeeRate / 100);
    netBenefit = projectedReturn - serviceCost;
    roi = serviceCost > 0 ? (netBenefit / serviceCost) * 100 : 0;
    paybackMonths = projectedReturn > 0 ? serviceCost / (projectedReturn / Math.max(periodMonths, 1)) : 0;
    story3 = `Фикс входа ${fmtMoney(preset.fixed)} + success fee ${fmtPct(successFeeRate)} от фактически возвращенной суммы. Итого сервис стоит ${fmtMoney(serviceCost)}.`;
  }

  if (tariff === "premium") {
    serviceCost = preset.fixed + projectedReturn * (successFeeRate / 100);
    netBenefit = projectedReturn - serviceCost;
    roi = serviceCost > 0 ? (netBenefit / serviceCost) * 100 : 0;
    paybackMonths = projectedReturn > 0 ? serviceCost / (projectedReturn / Math.max(periodMonths, 1)) : 0;
    story3 = `Premium нужен, когда кейс большой или срочный: фикс ${fmtMoney(preset.fixed)} + success fee ${fmtPct(successFeeRate)}.`;
  }

  if (tariff === "monitoring") {
    const preventionRate = marketplace === "multi" ? 0.82 : 0.75;
    const preventedLosses = claimAmount * preventionRate;
    projectedLabel = preset.projectedLabel;
    serviceCost = monitoringFee * periodMonths;
    netBenefit = preventedLosses - serviceCost;
    roi = serviceCost > 0 ? (netBenefit / serviceCost) * 100 : 0;
    paybackMonths = preventedLosses > 0 ? serviceCost / (preventedLosses / Math.max(periodMonths, 1)) : 0;

    setValueText(els.projectedReturn.previousElementSibling, projectedLabel);
    setValueText(els.projectedReturn, fmtMoney(preventedLosses));
    setValueText(els.netBenefitLabel, preset.netLabel);
    setValueText(els.netBenefitValue, fmtMoney(netBenefit));
    setValueText(els.serviceCost, fmtMoney(serviceCost));
    setValueText(els.potentialLosses, fmtMoney(potentialLosses));
    setValueText(els.claimAmount, fmtMoney(claimAmount));
    setValueText(els.roiValue, fmtPct(roi));
    setValueText(els.paybackValue, paybackMonths > 0 ? `${paybackMonths.toFixed(1)} мес.` : "—");
    setValueText(els.launchFormat, preset.label);
    setValueText(els.story1, `На горизонте ${periodMonths} мес. скрытые потери могут составить около ${fmtMoney(potentialLosses)}.`);
    setValueText(els.story2, `При регулярном контроле реально держать под управлением около ${fmtMoney(claimAmount)} и не давать сумме накапливаться.`);
    setValueText(els.story3, `Подписка стоит ${fmtMoney(serviceCost)} за выбранный период и может предотвратить потери на ${fmtMoney(preventedLosses)}.`);

    const recommended = getRecommendedTariff(monthlyTurnover, potentialLosses, periodMonths);
    const recommendedPreset = getTariffPreset(recommended);
    setValueText(els.recommendedBadge, recommendedPreset.badge);
    setNetTone(netBenefit);
    return;
  }

  const recommended = getRecommendedTariff(monthlyTurnover, potentialLosses, periodMonths);
  const recommendedPreset = getTariffPreset(recommended);

  setValueText(els.recommendedBadge, recommendedPreset.badge);
  setValueText(els.netBenefitValue, fmtMoney(netBenefit));
  setValueText(els.netBenefitLabel, preset.netLabel);
  setValueText(els.potentialLosses, fmtMoney(potentialLosses));
  setValueText(els.claimAmount, fmtMoney(claimAmount));
  setValueText(els.projectedReturn.previousElementSibling, projectedLabel);
  setValueText(els.projectedReturn, fmtMoney(projectedReturn));
  setValueText(els.serviceCost, fmtMoney(serviceCost));
  setValueText(els.roiValue, fmtPct(roi));
  setValueText(els.paybackValue, paybackMonths > 0 ? `${paybackMonths.toFixed(1)} мес.` : "—");
  setValueText(els.launchFormat, preset.label);
  setValueText(els.story1, `За ${periodMonths} мес. при обороте ${fmtMoney(monthlyTurnover)} в месяц скрытые потери могут достигать ${fmtMoney(potentialLosses)}.`);
  setValueText(els.story2, `После вычета уже компенсированной части и с учетом документальности в претензию можно брать около ${fmtMoney(claimAmount)}.`);
  setValueText(els.story3, story3);

  setNetTone(netBenefit);
}

Object.values(els).forEach((el) => {
  if (!el || !(el instanceof HTMLElement) || !("addEventListener" in el)) return;
  if (el.tagName === "INPUT" || el.tagName === "SELECT") {
    el.addEventListener("input", () => {
      if (el === els.tariff) syncTariffControls();
      render();
    });
    el.addEventListener("change", () => {
      if (el === els.tariff) syncTariffControls();
      render();
    });
  }
});

syncTariffControls();
render();
