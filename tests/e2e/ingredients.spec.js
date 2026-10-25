import { test, expect } from '@playwright/test';

test('four SVG and Three.js ingredients render and scrub without rebuilding geometry', async ({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/ingredients.html');
  await expect(page.locator('.collection article')).toHaveCount(4);
  await page.waitForFunction(()=>window.ingredientPreview?.models.length===4);
  await page.getByRole('button',{name:'Pause animations'}).click();
  const geometryIds=()=>page.evaluate(()=>window.ingredientPreview.models.map(model=>{
    const ids=[];model.traverse(item=>{if(item.geometry)ids.push(item.geometry.uuid);});return ids;
  }));
  const before=await geometryIds();
  await page.getByRole('button',{name:'Three.js',exact:true}).click();
  for(const time of [0,1,2,3,4,5.59,8,11.99]){
    await page.locator('#time').fill(String(time));
    await expect(page.locator('#clock')).toHaveText(`${time.toFixed(2)} s`);
  }
  expect(await geometryIds()).toEqual(before);
  expect(before.every(ids=>ids.length>0)).toBe(true);
  expect(errors).toEqual([]);
  const invalid=await page.evaluate(()=>{
    let count=0;window.ingredientPreview.models.forEach(model=>model.traverse(item=>{
      if(item.geometry&&!Array.from(item.geometry.attributes.position.array).every(Number.isFinite))count++;
    }));return count;
  });
  expect(invalid).toBe(0);
});
test('reduced motion starts paused and no CSS ingredient animations run',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/ingredients.html');
  await expect(page.getByRole('button',{name:'Play animations'})).toBeVisible();
  expect(await page.evaluate(()=>document.getAnimations().length)).toBe(0);
});
test('preview fits a narrow phone without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:320,height:740});await page.goto('/ingredients.html');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
