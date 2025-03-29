// Base64 encoded images for our game
const IMAGES = {
    // Simple player standing facing forward
    player: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAL8SURBVFiF7ZZNbBtFFMd/M7vrXTtx7NghCU5CiFNRkzZq05AgiqqWA6gckEBCQkgIqRy4VOLAgQsHLhy4VOIGEhJCQoIDEkgV4sCBQ9UWJQiJfkCbhjZ1GpLYiWPH9q53Z4bDetfr/YibqBV/aaSdee+9+b+Z92ZWGGP4P0se9QJKqVx7eXl5RCl1QwhxWWv9EPDgHrEdpdRnwHta65uLi4t7SZzYDwwPD4+0Wq3rwGhG/reMMZ8vLS39tLCwsBsXDGYBSqXSc8aYj4UQF7OE7YMtpdQbWuuP5ufn96KdEYDW+rKeU0rpAPA88AQwCpwFhoDW3vt7QAN4HVgQQqwAJx6VpwJQSs3Ozs4uhWZrErgCPAyUgVPAMBAAlwAPqAGrwCZwjMlMkAhASjmvlHpRa71eqVROa60vA1NAEfBThm0DbeBv4A9gEziZSuHs7GxrgXhWAA+4CLyklHoN2AU+Av4EngWeBs4kxG0A6Xf6ThYHEgWcFkI80Ww2jwEDwBngMeBxYAJ4FBgkkiVAYCTNXj+JA5BG6u7Ajm0BQ9gUdoA9INQRvhCiZzpn2TEiWAc2iIrsDDa9NaBpDPUgzLVbj+1ggPsL2L2FIETGRAvYtXPcxArvVm09VGr0hL5fxxGLVGoClwqPMOifInDrCH0cjCQMuwPCGxWgGiHdx+l9xukKdTbPnp6ccwfwRVgI9MZxI04CIBFGEJrAnoRUaVoYdh0vU992hUQC7rTXtG4P5BwQhLVqS+M5ciyBJLPLM3YQwUhlEPNPgXMnz+C5BTrDEkHQwRjT83RGz0zIGzNQPB/+OT7Sd3BKxwFIPBfc6lFc0SnSaQUILOd9Ud1q8dOX39E0+4QdTWgMImUvYlESQQqLoyAMQxpHFQTYmxDeEdBeDXDc7LR0Vggh8X2XwcIg48+MMzA6AEHMHbHtxN0vZexyYfAKPs36tdvs3G3gDrk4Q05WEXXbfT+D3PJlBHhOgVNPjnHuykUKY4O0qy06u228QRfH83p/RtL2+hGi76f4/ygXLvxtDLcARtKvlkIIGGEAAAAASUVORK5CYII=",
    
    // Simple house/building
    building: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAVDSURBVHic7ZtpbFRVFMd/584bOm1ZWhYpLUuVQqEFIovsuyAiJBoICQYSjQTjB/0kxkSNfvGLMdEYNbIYAkETQSCisgUIICJQKHtboFCgdKGdmc7Me8cPM53OdN7UmXlvpsT5J5OZ++4995z/effcc+69T1QVn4tgdweswh+A1wMw2wGVlZX5tbW1c1W1REQmAIOMMQVALuAHUNV2EWkWkWagXlVrReSYMeaI3+/fU1ZW1mKWA6YEUFFRMbqtre1BVV0AzAWGp3A7BaqMMdtFZEtBQcHWJUuWtKXaOVMCKC8vnxUIBF5R1cWApHq/LhCgQkTeLi0t3ZJqP0wJIBQKbbDZbM/F8/32v/8kLu0i8Vt0VDXyGm7TcFu4LhwOh1+bN2/eh6l23pQALCZsXPL6J6q6CrgnlRuk4oAmEWmIOv83Ihb2FiLSbLfbJxYXF59MpbMJ5QAR+VVVJyXTsVj3imZlq1rYABOAPfGu6SmAX4wxFarc1NPNupvRfXFnpTtGQEQOxrsmoQAURHg2kY71RLrucbgNc0B0XTj8HnkoirY9YIyJ6ZSEAhCR0ljn0019YZ7FuxeqGjNMxhVAOtHXTkwlGiQUQKrZP914oLeIOQaLyHUzZEkXkqhbDMYYmzdmgXjDbKyzQVX9qnpRVS8D11S1BeiI0T5HRPJFpEhE7lHVUSIyPBl9xg2BtPDgIxI+70Xk84KCgi/j5YDKysph7e3tT4vIcuB+On9oqrQDe4F1LpfrveXLl19P+A6R3F/E9E1GR/5w+KMi8m5paem7vbW73//Q4XC8KiIbgWERvaSLHOApVd28Zs2aBxIFoF26XJqxfqjYRAKBwOZk/f8DlZeXP2KM2UIneFMAROTJvLy8F21eDyBdeADIFpGPTp061ZLo7Q9QVla2FtgU0RfrF0YcGu5/9ZT78/Pz1yUKwOiMHpMiQqA9Oc0lQ7vdbv84IQcYY2pcLtclm9cDiEpnJkgDIhIaO3bsvQkdMHz48L3Nzc3G1BCI3g9IEzEmgvb29l8SDgEROd7a2nrVzCEAaX/QhDq5f//+xpgC2LVrV1NZWdm3wEYz3x4pjc22H1T1o9OnTzfEvCKJQ+HqeMekiahDIVXZc+bM2RzrmpgC8Pl8n7lcrs9UNT9VLfaGZuD8SER21dTUVMXrb0J5YO3atceLiop2ABkXgTHmmMvlutjT3BxXANu2bWvYuXPnVhHZm3HpKxwWkc2JKqSE88CKFSsa8/Ly1ovI15mQfor8LCLvJNMw4USwatWqpkGDBq0Tkc0Zc0ASGGN+UtW3km2fVB5YvXr1dY/H84mIfJEm7SXDJRHZEAgENiQiPCJIKgAIrxFmDhw4sM7n872vqu9xc+JAVbUB2ODz+T4YNWrU9UWLIF7FKyKpxMHKysr81tbWt1R1OTAylWd1Q5OIfBkMBj/z+/3VqTwopQDADwAtLS1PAO/R+adKKogxZmdOTs5Gt9v9a7KznngkHQWi8Hg8nwJPUlFRMUpV14jIk0CvcTGCVhHZbozZ4Ha714c3Sno8fRLXAcYYbDYbdjsdp9OJw+HAbrdjjMFms2GMQVXxer243W5EBJdLIpdVRXE6HbTsGYuINNpstoOq+jXwK3BA27YPEOFHr9d7nTh/dIjqm45lkLB1lqGhUCi8SGKz4cDr9UZWlDqCQcLhs/PPD7/fb9eRrq6uS8AJ4ARwMtZKTjjYQkLg84QyMASS+TCiNxENpVwN6mviBmCxEDLvZ6kF+B3g9QDM+zoMQwDo3wJYBGa+/wOvB/A/HILMDwAl4gYAAAAASUVORK5CYII=",
    
    // Simple chair
    chair: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHASURBVFiF7ZY9SwNBEIafu0tCEIloIdhZWFhYWQiCjZ2FjYWFhYWFlYVgZ2NhJVhYCP4DCwsLCwuLgGBhYSFoISgSNF7u1uIiucvd5XKXD7Hxhb3dmd15ZmY/boWI8J/l/XUAZpSpcKiYmCXA4KOIiA3AzCxhYgVYBmaBKWAC6AMdoA00gTrQ0PXg9DlYuIuNArAEvAKvQogzEbk0t0QMYKYEHAAVIPu9Pqwsoxcb43V9RdpArwrsmWKsAGbmgFPg0M5a8dWOXVU4qg0pA1vAPrBkTVtE2gNAO8CZiNyY1WE7Ykc9Fg2IGXu+DWB0DIiLRDECF3ipyH0u0XbmLLrYYhqHJpDR8p1TZJB9yIo8BtwCHuBrIRKNQGuxXQnH7i0il8CJQloWIpEAgWfzPtHPjooLCu45mLe9E/8TlkoiFLRuq0pXE1FJ81oHN/XWPe1n9Xy2Df+BdtqHlgM6W9Y0r+kEsFsRHEZOAC1I4VfX3SYSWAbcACvkdIgG1JZu6vg9QC1diBMgDYdoA2vAM1DScTnknS9+3xRrLEhAl8Ae8ATsiMh9lIl4m1G+wSQTmfKxAnjeKAAmgc+//hf81xq8AR0fq4JpkZx7AAAAAElFTkSuQmCC",
    
    // Simple desk
    desk: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFTSURBVGiB7ZixSgNBEIa/uUQQbISAjWBhYWNhIQg2dhY2NhYWPoCFhYWdhYVgYyEINhaCTyDYWFhYWFhYCIJYWIhFMCDJWVwEQe5yt3e7lwz8zd3szH7zz93dSBhjDG2m03QBZWMFtN6A0FcYYzAm+W82m6Y7e6LZWMA+MA8cd0YVAXALDAtPFcICvoBXgvlWxkNggjhgBAwCbSyAIVAHTmNjd8AXMJ2zZp8F4ADwBcRNzzfCdyAUJuTVh+4IeBHR9N7kcCCcAkMc9r+KAHgAjoDnJE1eCvSAi4r2gDeghsM5lxGgdfQhH+kBq7mLVMIHsAj04zT5KLCGHl++aAIfOQpUxRPJZ2ImMnPALrCEXhN0gE3gjPy9RArNGLAF3OeYw+qAt9gvP0gE0MLZ0CTH3G1gjdDvgVnD0TBLgCbIFmAHITsI2VHYjsN2IfIXEoMxpvUfRLUPQ78BZ2yKOhN9R8AAAAAASUVORK5CYII=",
    
    // Simple door
    door: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE8SURBVFiF7ZUxTsNAEEX/rBM5iCVDQQUUFJQ5A0fgHJyCK3AFbsEROANlCk5AQREkQAKJyDHehSKJnY3XjrMFxZN2Z+zvef7szszKzPD/dYr/MFJVichQQkFdq+pM5IZF0DcfXf9Hc4D8Av6YA7oCnKEbjXfRCXqkpCyPMvAe4QCaFt5GJkCNdp5rS6V1vZnrG1EDNBCgcUIm5uWkV/rr4qUCXNu4t74FODLGJDayjapGGcSYdq5NATJr7cYijK2wLKuD6y1AUk37HjHDwEzvnGvt1QDWWucKJzOYWVmWt6jnrQCqui4mYQJ3F8PBYvb4tGzz0ApgZpsyNzFDv5Qzs0VzTw5cGD51ztkUr0tdrxGXMYC+AHU9K49xXyAVsBLRQlX7lqAyswtzL8QAlEV+JwEBvgHXsHzVO8RfPQAAAABJRU5ErkJggg==",
    
    // Simple bed
    bed: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAgCAYAAACFM/9sAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAMGSURBVGiB7ZpNaBNBFMf/b3azidVWW0O0IFIVRRQPXrzowYsXDyJ48CKI4MGjIKIo3sWTUPAgeBAUQfDkxYsHEUEQL3pRECoWC1oQpLFpk93nYbPVGLabMjObtPnBsMzsvNn933vz8TYihECzgZi9QFVXMsZaAdwA4AKIAwgBuAQwDkAWVXUCwDRjrI+I+gGMElFJCDFvNnNzZ6AI4HREDBhj/xO7CSAPQOeyiAEYYIztjdqQcblaCjDGpKyqJr4S41yBJQghRH0HMsaWuc+TAL44ARRF8bkQ4uXPFbvs59qsAqIQghDLy0H1jXxcJ5N0n5UXMQPATUEIrJYbBXUDQghwzkFEZq0cAPuCIBgbHh4u1XZGfg7UHVA7SZIkCCGMCpBlGbIsR53lHoBtwWDw1djYmFc7wKiA2klKkgQi0i1AURQQUdQpJQB5AKJxcHBwTmtEwVzImtTmQNNUt1q1AVEVOI0I0DNzrR9qHnSbMu60AiTGmKTnl76C6Jy41iZLKiBSTiO6BDDGOIiIn2WDrR64nrYSdwqFwm2tgWpVCj3XXeuAK+2miKgSwbkAAP4S0YzW+BNb1bYGIqIZALNaI5frPAIAvrfAnIioXO/l9V5AQ1VYljNmVECtnCpR8Hzf9lCMihCC45xzowoopVLIssyJSAHAay4QAADnvALAswVkMhnrHzeNquAHx3ERwKgWUlbPJKuqqocxZtQD8/k8GGNRo/5RJBIpRkYR0Rshhq0ybKGKRIyBMeZCiDdRO50CAIyMjHCdOWaVoRUhSRJkWdY8UJZlZLPZxYxZZTgHYMbzPE9rSKVSRgWoqopUKqUrB8qyjHQ6vTg7qwzP+77/XmtIJpNLX07ooRZbMpmM7EssFkM8Ho9ac957rjfZiyh7+q/l83nkcjldJ2Az2RwAQER5zvlFAGdqO1dYQGGV8x1CiBPZbHaytrP+s9D3fQgh2onoFBH1CiFcLkTdXyvrgRrXKaXSp8a7wF0AZ4UQs0YztxPmXkMIcR3AA9vbmOEHG7ixzU76MocAAAAASUVORK5CYII=",
    
    // Simple table
    table: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHCSURBVGiB7Zo9TsNAEIU/OyAXKaGhoKLiAlQcgYqKK1ByBSouQIVEQcEBEEVokJDiOLurYmTZieOfsZeIPMlay7Mz8968XXtscc7xn7XxaoCq8QH8eQNqQceRc+BsO2qcc3jm7YDLWAO6wDEwACbAwCn1Yox5BfqWiEYHsAsMgSte9jtb+QD2YwzogkOgD4yBT+DD+z55BtwDx9ZlUNUdoAecAKecmA9YPo0xb0DPEjGvCT6Ba4Jdz9OnP68I3U1uuAE4A24jPr9w3QIngQYjYnTbPz/3+4LTqWuHgD8nwgBrvRE+QuhbRQwAY8w78AK8pQCrqgdcAhekcb+SJK/NHLSjA3z4+wMRR+OiMZxz0iLnAA2gCVkPmK4XJIoi0Tt+JzX3/YRxqrpHcM7NRHAOaDSbEUfg4mnQfwp8Z30qqA2wvRc15wCHwLFKrMzK2rTGAUaWAakaYK1N+SxbqSKRnTDvLuBZzQBjzAhoAXeW71PVBmHu71qisA5QZwq/gNPW1N8naIAxpgVceY1DLdCa0MeYRwELIpH1FLgeZ7kQnSc4tzkJE9jl/Fqwyvk/Zcv5P2bLBXwB+AY2tIqKJDoAAAAASUVORK5CYII=",
    
    // Simple bookshelf
    bookshelf: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAA8CAYAAAAUufjgAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGiSURBVGiB7ZkxbsIwFIY/O0OHDh06dOjQpUOHju1SiTPkCrkDV+hcqTdg7MKCC1RduvWkpaqQ4qEvQ1VVsZ34xSYtkr9kyX7P/t6zYr04IoIxl8YOY6YLNA1wbYAGaBqgaYCmAZoGaLrAbkSkBWwzDPFDRPphsBKR9AkM6APXmZpvg3ELvNUFWLX3tsiEiGBSF2CV77V2XYB9zjOQARE5Aq9pfP6dxHO3bYAGaBqgaYCmAZoGaBqgaYCmAZoqp7kEz3kL/Ah85WTPOW+BjYgMA6RVASYdI+e8c0CE8Yl90QgN99oOJCLCfr9nNpuxWq2YTqd8fX3x+flJv99nPB7TarW4ubnh/v6ebrf7rY+qO5glyXq9ptPpMJlMeHh44PHxkdFodCj3fZ/Hx0eGwyGLxYLlcsl2uyVpmktCVAdM05TdbserDJ+fn5nNZvR6vd91wzCk3W6f9I+iiOl0ynw+p9PpnPStesV/6/7+noeHBx4eHlgul6dlItIRkbeMLRYRGcQxTETiOPbFcXycRK9qDIvIi4iMYh9fJCJRHPsiIn5JXtH51YVbXLh1M8CLzv8LB3jpekgJndMAAAAASUVORK5CYII="
}; 

// Define fallback image loading function that creates simple images if real ones can't be loaded
function loadImages() {
    console.log("Loading images...");
    return new Promise((resolve) => {
        // Create fallback player sprite if needed
        if (!window.player.spriteImg || !window.player.spriteSheet) {
            console.log("Creating fallback player sprite");
            window.player.spriteSheet = createFallbackPlayerSprite();
            window.player.spriteImg = new Image();
            window.player.spriteImg.src = window.player.spriteSheet;
        }
        
        // Load job building image
        if (window.jobBuilding && !window.jobBuilding.img) {
            window.jobBuilding.img = createSimpleBuildingImage();
        }
        
        console.log("Image loading complete (with fallbacks if needed)");
        resolve();
    });
}

// Create a simple player sprite as fallback
function createFallbackPlayerSprite() {
    console.log("Creating fallback player sprite");
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256; // 4 rows for directions
    const ctx = canvas.getContext('2d');
    
    // Draw simple character for each direction (down, up, left, right)
    ['down', 'up', 'left', 'right'].forEach((direction, index) => {
        const y = index * 64;
        
        // Body
        ctx.fillStyle = 'blue';
        ctx.fillRect(16, y + 16, 32, 32);
        
        // Head
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(32, y + 16, 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'black';
        
        if (direction === 'down' || direction === 'up') {
            ctx.fillRect(24, y + (direction === 'down' ? 12 : 20), 6, 6);
            ctx.fillRect(40, y + (direction === 'down' ? 12 : 20), 6, 6);
        } else if (direction === 'left') {
            ctx.fillRect(22, y + 16, 6, 6);
        } else { // right
            ctx.fillRect(42, y + 16, 6, 6);
        }
    });
    
    return canvas.toDataURL();
}

// Create a simple building image as fallback
function createSimpleBuildingImage() {
    console.log("Creating fallback building image");
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Building base
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, 150, 100);
    
    // Door
    ctx.fillStyle = '#333';
    ctx.fillRect(60, 60, 30, 40);
    
    // Windows
    ctx.fillRect(20, 30, 25, 20);
    ctx.fillRect(105, 30, 25, 20);
    
    // Roof
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(75, -30);
    ctx.lineTo(150, 0);
    ctx.closePath();
    ctx.fill();
    
    return canvas.toDataURL();
}

// Make sure these functions are available globally
window.createFallbackPlayerSprite = createFallbackPlayerSprite;
window.createSimpleBuildingImage = createSimpleBuildingImage;
window.loadImages = loadImages; 