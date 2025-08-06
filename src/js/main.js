function nutrition() {
  const 
    sex = document.querySelector('#sex').value,
    age = document.querySelector('#age').value,
    height = document.querySelector('#height').value,
    weight = document.querySelector('#weight').value,
    activity = document.querySelector('#activity').value,
    manualCalories = document.querySelector('#manualCalories').value,
    bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) + ((sex == 'man') ? +5 : -161)),
    tdee = Math.round(manualCalories ? manualCalories : bmr * activity),
    caloriesPerPercent = 7700 * (weight * 0.01),
    caloriesGain = Math.round((caloriesPerPercent / 30) + tdee),
    physique = document.querySelector('#physique').value,
    caloriesWeeklyTdee = tdee * 7,
    lossPercent = physique == 'shredded' ? 0.25 : 0.5,
    lossPercentCalories = caloriesPerPercent * lossPercent,
    refeedDays = physique == 'shredded' ? 3 : physique == 'lean' ? 2 : 1,
    caloriesLoss = Math.round((caloriesWeeklyTdee - (lossPercentCalories + (refeedDays * tdee))) / (7 - refeedDays)),
    goal = document.querySelector('#goal').value;

  const totalCalories = 
    goal == "losefat" ? `${refeedDays} x ${tdee} kcals, ${7 - refeedDays} x ${caloriesLoss} kcals (${lossPercent}% weekly weight loss)` : 
    goal == "maintain" ? `${tdee} kcals` : 
    `${caloriesGain} kcals (1% monthly weight gain)`;

  const totalProtein = Math.round(
    goal == "losefat" ? 
      physique == "shredded" ? weight * 2.6 : 
      physique == "lean" ? weight * 2.3 : weight * 2.2 : 
      physique == "chubby" ? weight * 2 : 
    weight * 2.2);

  const totalFats = Math.round(
    goal == "losefat" ? (caloriesLoss * 0.25) / 9 : 
    goal == "maintain" ? (tdee * 0.25) / 9 : 
    (caloriesGain * 0.25) / 9);

  const totalCarbs = 
    goal == "losefat" ? `${refeedDays} x ${Math.round((tdee - ((totalProtein * 4) + (totalFats * 9))) / 4)}g, ${(7 - refeedDays)} x ${Math.round((caloriesLoss - ((totalProtein * 4) + (totalFats * 9))) / 4)}g` : 
    goal == "maintain" ? `${Math.round((tdee - ((totalProtein * 4) + (totalFats * 9))) / 4)}g` : 
    `${Math.round((caloriesGain - ((totalProtein * 4) + (totalFats * 9))) / 4)}g`;

  const totalSugar = Math.round(
    goal == "losefat" ? (caloriesLoss * 0.1) / 4 : 
    goal == "maintain" ? (tdee * 0.1) / 4 : 
    (caloriesGain * 0.1) / 4);

  const totalFibre = Math.round(
    goal == "losefat" ? (caloriesLoss / 1000) * 14 : 
    goal == "maintain" ? (tdee / 1000) * 14 : 
    (caloriesGain / 1000) * 14);

  const totalSaturatedFats = Math.round(
    goal == "losefat" ? (caloriesLoss * 0.1) / 9 : 
    goal == "maintain" ? (tdee * 0.1) / 9 : 
    (caloriesGain * 0.1) / 9);

  document.querySelector('.calories').innerHTML = `${totalCalories}`;
  document.querySelector('.protein').innerHTML = `${totalProtein}g`;
  document.querySelector('.carbs').innerHTML = `${totalCarbs}`;
  document.querySelector('.sugar').innerHTML = `${totalSugar}g`;
  document.querySelector('.fibre').innerHTML = `${totalFibre}g`;
  document.querySelector('.fats').innerHTML = `${totalFats}g`;
  document.querySelector('.saturated').innerHTML = `${totalSaturatedFats}g`;
  document.querySelector('.omega').innerHTML = `1-2g (DHA+EPA)`;
}

document.querySelectorAll(["select", "input"]).forEach((trigger) => trigger.addEventListener("change", () => nutrition()));
