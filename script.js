import { recipes } from "./recipes.js";
console.log(recipes);

const cardContainer = document.getElementById("card-container");
const totalNbrOfRecipes = document.getElementById("total-nbr-of-recipes");
const searchInput = document.querySelector(".search-bar");

const ingredientsFiltersList = document.getElementById("ingredients-filters-list");
const applianceFiltersList = document.getElementById("appliance-filters-list");
const ustensilsFiltersList = document.getElementById("ustensils-filters-list");
const filtersActiveList = document.getElementById("filters-active-list");

const activeFilters = {
    ingredients: new Set(),
    appliance: new Set(),
    ustensils: new Set()
};

// Function to create the list of recipes
function createRecipesList(recipes) {
    cardContainer.innerHTML = "";  // Clear the card container before adding new recipes
    recipes.forEach(recipeCard => {
        const { time, name, image, description, ingredients } = recipeCard;

        // Create a new div for each recipe
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add("card", "recipe-card", "p-0", "col-11", "col-md-5", "col-xl-5", "col-xxl-3");  // Bootstrap grid classes
        recipeDiv.innerHTML = `
                <div class="recipe-time bg-warning text-dark">${time} min</div>
                <img src="images_recettes/${image}" class="card-img-top mb-3" alt="${name}">
                <div class="card-body">
                    <h5 class="card-title mb-3">${name}</h5>
                    <div class="mb-2 text-secondary">Recette</div>
                    <p id="card-text" class="mb-4 card-text">${description}</p>
                    <div class="mb-2 text-secondary">Ingrédients</div>
                    <div class="card-ingredients d-flex gap-3 flex-wrap mb-5">
                        ${ingredients.map(ingredient => `
                            <div class="ingredient d-flex flex-column col-5">
                                <span class="ingredient-name">${ingredient.ingredient}</span>
                                ${ingredient.quantity ? `<span class="ingredient-quantity text-secondary">${ingredient.quantity} ${ingredient.unit ? ingredient.unit : ''}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            
        `;

        cardContainer.appendChild(recipeDiv);
    });
    totalNbrOfRecipes.innerText = `${recipes.length} recettes`;
}

// Generic function to generate filters
function generateFilters(recipes, filterType, filterList, filterFunction, activeFilterSet) {
    const filterSet = new Set();
    recipes.forEach(recipe => {
        if (filterType === 'ingredients') {
            recipe.ingredients.forEach(item => !activeFilterSet.has(item.ingredient) && filterSet.add(item.ingredient));
        } else if (filterType === 'appliance') {
            !activeFilterSet.has(recipe.appliance) && filterSet.add(recipe.appliance);
        } else if (filterType === 'ustensils') {
            recipe.ustensils.forEach(item => !activeFilterSet.has(item) && filterSet.add(item));
        }
    });

    filterList.innerHTML = "";
    filterSet.forEach(filterItem => {
        const filterElement = document.createElement('li');
        filterElement.innerHTML = `<a id="${filterItem.toLowerCase().replace(/ /g, '-')}-filter" class="dropdown-item" href="#">${filterItem}</a>`;
        filterList.appendChild(filterElement);

        filterElement.addEventListener("click", () => filterFunction(filterItem));
    });
}

function addActiveFilter(filterType, filterItem) {
    const filterId = `${filterItem.toLowerCase().replace(/ /g, '-')}-active`;
    if (!document.getElementById(filterId)) {
        const activeFilterElement = document.createElement('span');
        activeFilterElement.id = filterId;
        activeFilterElement.classList.add("col-3", "btn", "btn-custom", "filter-active", "bg-warning", "mb--md-5");
        activeFilterElement.innerText = filterItem;
        activeFilters[filterType].add(filterItem);
        activeFilterElement.addEventListener("click", () => {
            activeFilterElement.remove();
            activeFilters[filterType].delete(filterItem);
            updateFilteredRecipes();
        });
        filtersActiveList.appendChild(activeFilterElement);
    }
}

function applyFilters(recipes) {
    return recipes.filter(recipe => {
        const matchesIngredients = [...activeFilters.ingredients].every(filter => recipe.ingredients.some(ing => ing.ingredient === filter));
        const matchesAppliance = [...activeFilters.appliance].every(filter => recipe.appliance === filter);
        const matchesUstensils = [...activeFilters.ustensils].every(filter => recipe.ustensils.includes(filter));
        return matchesIngredients && matchesAppliance && matchesUstensils;
    });
}

function applySearch(recipes, searchString) {
    return recipes.filter(recipe => {
        const searchLower = searchString.toLowerCase();
        return recipe.name.toLowerCase().includes(searchLower) ||
            recipe.description.toLowerCase().includes(searchLower) ||
            recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(searchLower));
    });
}

function updateFilteredRecipes() {
    let filteredArray = applyFilters(recipes);
    const searchString = searchInput.value.toLowerCase();
    if (searchString.length >= 3) {
        filteredArray = applySearch(filteredArray, searchString);
    }
    createRecipesList(filteredArray);
    updateFilters(filteredArray);
}

function filterByIngredient(ingredient) {
    addActiveFilter('ingredients', ingredient);
    updateFilteredRecipes();
}

function filterByAppliance(appliance) {
    addActiveFilter('appliance', appliance);
    updateFilteredRecipes();
}

function filterByUstensil(ustensil) {
    addActiveFilter('ustensils', ustensil);
    updateFilteredRecipes();
}

function updateFilters(recipes) {
    generateFilters(recipes, 'ingredients', ingredientsFiltersList, filterByIngredient, activeFilters.ingredients);
    generateFilters(recipes, 'appliance', applianceFiltersList, filterByAppliance, activeFilters.appliance);
    generateFilters(recipes, 'ustensils', ustensilsFiltersList, filterByUstensil, activeFilters.ustensils);
}

createRecipesList(recipes);
updateFilters(recipes);

searchInput.addEventListener("input", updateFilteredRecipes);