// Import tags
import { Tags } from '@/components'

export function Filters(recipeData) {
  // Get elements
  const filters = document.querySelector('.filters')

  // Create filters for each category
  Object.keys(recipeData.filters).forEach(category => {
    // Translate category
    const categoryTranslation = {
      ingredients: 'ingrédients',
      appliances: 'appareils',
      ustensils: 'ustensiles'
    }

    // Get template
    const template = document.querySelector('#filter-category-template')

    // Clone template
    const clone = template.content.cloneNode(true)

    // Get elements
    const filter = clone.querySelector('.filter')
    const filterButton = clone.querySelector('.filter__button')
    const filterButtonText = clone.querySelector('.filter__button-text')
    const filterDropdown = clone.querySelector('.filter__dropdown')
    const filterLabel = clone.querySelector('.filter__label')
    const filterInput = clone.querySelector('.filter__input')
    const filterList = clone.querySelector('.filter__list')
    const filterNoResults = clone.querySelector('.filter__no-results')

    // Set attributes
    filter.dataset.filterCategory = category
    filterButton.dataset.filterCategory = category
    filterDropdown.dataset.filterCategory = category
    filterLabel.htmlFor = `filter-input-${category}`
    filterInput.id = `filter-input-${category}`

    // Set values
    filterButtonText.textContent = categoryTranslation[category]

    // Create filters for each item
    recipeData.filters[category].forEach(item => {
      // Create template
      const template = document.createElement('template')

      // Set template
      template.innerHTML = `
        <li class="filter__item" data-value="${item}" title="${item}">
          <button class="filter__item-button">${item}</button>
        </li>
      `

      // Append
      filterList.append(template.content.cloneNode(true))
    })

    // Append clone to filters
    filters.append(clone)

    // Open/close dropdown
    filterButton.addEventListener('click', event => {
      // Get states
      const ariaHasPopup = filter.getAttribute('aria-haspopup')
      const ariaExpanded = filterButton.getAttribute('aria-expanded')

      // Set states
      filter.setAttribute('aria-haspopup', ariaHasPopup === 'true' ? 'false' : 'true')
      filterButton.setAttribute('aria-expanded', ariaExpanded === 'true' ? 'false' : 'true')
      filterDropdown.hidden = !filterDropdown.hidden

      // Focus input if not disabled
      !filterInput.disabled && filterInput.focus()
    })

    // Close dropdowns
    const CloseDropdowns = () => {
      // Set state
      filter.setAttribute('aria-haspopup', 'false')
      filterButton.setAttribute('aria-expanded', 'false')
      filterDropdown.hidden = true
    }

    // Reset input
    const ResetInput = () => {
      filterInput.value = ''
      filterInput.dispatchEvent(new Event('input'))
    }

    // Close dropdowns on click outside
    document.addEventListener('click', event => {
      !filter.contains(event.target) && (CloseDropdowns() || ResetInput())
    })

    // Close dropdowns on escape
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        filterInput.value ? ResetInput() : CloseDropdowns()
      }
    })

    // Search filter
    filterInput.addEventListener('input', event => {
      const Normalize = string =>
        string
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .split(/\W+/)

      // Get filter value
      const filterValue = Normalize(event.target.value)

      // Loop through filter items
      filterList.querySelectorAll('.filter__item').forEach(item => {
        // Get dataset value
        const itemValue = Normalize(item.dataset.value)

        item.hidden = !filterValue.every(value => itemValue.some(keyword => keyword.includes(value)))

        // If all items are hidden, show no results
        if (filterList.querySelectorAll('.filter__item:not([hidden]):not([filtered])').length === 0) {
          filterList.setAttribute('no-results', '')
          filterNoResults.hidden = false
        } else {
          filterList.removeAttribute('no-results')
          filterNoResults.hidden = true
        }

        // If all items are filtered hide no results
        if (
          filterList.querySelectorAll('.filter__item[filtered]').length ===
          filterList.querySelectorAll('.filter__item').length
        ) {
          filterNoResults.hidden = true
        }
      })
    })

    // Select filter item
    filterList.querySelectorAll('.filter__item-button').forEach(filterItemButton => {
      filterItemButton.addEventListener('click', event => {
        Tags(event, category, filterList, recipeData)

        // If all items not filtered and not hidden are selected, disable input
        if (
          filterList.querySelectorAll('.filter__item:not([filtered])').length ===
          filterList.querySelectorAll('.filter__item:not([hidden]):not([filtered])[selected]').length
        ) {
          filterInput.disabled = true
          filterInput.placeholder = 'Recherche désactivée'
        } else {
          filterInput.disabled = false
          filterInput.placeholder = 'Rechercher un filtre'
        }

        // Reset input
        ResetInput()
        filterInput.focus()
      })
    })
  })

  // On blur of search input hide filters
  document.addEventListener('searchDone', () => {
    // Get recipes
    const recipes = document.querySelectorAll('.recipe-card:not([hidden])')

    // Get IDs
    const recipesIds = Array.from(recipes).map(recipe => recipe.dataset.recipeId)

    // Get filters
    const recipesFilters = [
      ...new Set(recipesIds.map(id => recipeData.find(recipe => recipe.id === Number(id)).filters).flat())
    ]

    // Loop through filters items
    document.querySelectorAll('.filter__item').forEach(item => {
      // Get value
      const value = item.dataset.value

      // Check if values matches filters
      recipesFilters.includes(value) ? item.removeAttribute('filtered') : item.setAttribute('filtered', '')

      // If all items are filtered and selected, disable input
      if (
        item.parentElement.querySelectorAll('.filter__item:not([filtered])').length ===
        item.parentElement.querySelectorAll('.filter__item:not([filtered])[selected]').length
      ) {
        item.parentElement.parentElement.querySelector('.filter__input').disabled = true
        item.parentElement.parentElement.querySelector('.filter__input').placeholder = 'Recherche désactivée'
      } else {
        item.parentElement.parentElement.querySelector('.filter__input').disabled = false
        item.parentElement.parentElement.querySelector('.filter__input').placeholder = 'Rechercher un filtre'
      }
    })

    // Dispatch input event
    document.querySelectorAll('.filter__input').forEach(input => input.dispatchEvent(new Event('input')))
  })
}
