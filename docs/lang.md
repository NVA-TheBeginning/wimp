# Ubiquitous Language

## Bounded Contexts

| Context                  | Responsibility                                                  |
| ------------------------ | --------------------------------------------------------------- |
| **Crops**                | Models plant species, their properties, and companion rules     |
| **Garden**               | Models the physical garden space and its layout                 |
| **Planting Intelligence**| Algorithms that decide where to place crops in the garden       |
| **Shared Kernel**        | Cross-cutting building blocks used by all contexts              |

## Crops

| Term                        | Type          | Definition                                                                                                      |
| --------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| **Crop**                    | Aggregate     | A plant species that can be grown in a garden. Owns its name, harvest period, and companion associations.        |
| **Crop Name**               | Value Object  | The normalized, lowercase name of a crop (1-100 characters). Two crops with the same name are the same species.  |
| **Harvest Period**          | Value Object  | The time window during which a crop produces food, defined by first harvest day, last harvest day, and lifespan. |
| **Companion Type**          | Value Object  | The nature of a relationship between two crops: either **helps** (beneficial) or **avoid** (forbidden).          |
| **Companion Registry**      | Domain Service| A read-only knowledge base that answers questions about companion relationships between crop species.             |
| **Companion**               | Concept       | A crop that has a known relationship (helpful or forbidden) with another crop.                                   |
| **Associate**               | Action        | To record that one crop is a companion of another, after validating domain rules.                                |
| **Forbidden Companion**     | Concept       | Two crops that should never be planted next to each other (e.g. tomato and fennel).                              |
| **Helpful Companion**       | Concept       | Two crops that benefit from being planted near each other (e.g. tomato and basil).                               |
| **Companion Associated**    | Domain Event  | Raised when a crop successfully records a new companion association.                                             |

### Specifications (Crops)

| Term                                    | Definition                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| **Companion Association Specification** | Composite rule: a crop can be associated with a companion only if it is not itself and not forbidden. |
| **Not Self Association**                | A crop cannot be its own companion.                                             |
| **Not Forbidden Companion**             | A crop cannot be associated with a crop the registry marks as forbidden.        |

### Exceptions (Crops)

| Term                              | When it occurs                                                    |
| --------------------------------- | ----------------------------------------------------------------- |
| **Cannot Associate Crop To Itself** | Attempting to make a crop its own companion.                     |
| **Forbidden Companion Association** | Attempting to associate two crops the registry marks as forbidden.|
| **Invalid Crop Name**              | A crop name is empty, too long, or otherwise invalid.            |
| **Invalid Harvest Period**         | Harvest period days are negative or in an invalid order.         |


## Garden

| Term               | Type          | Definition                                                                                                   |
| ------------------ | ------------- | ------------------------------------------------------------------------------------------------------------ |
| **Garden**         | Aggregate     | A bounded physical space where crops are planted. Has a fixed size and maintains an ordered field of plots.   |
| **Gardener**       | Entity        | A person who tends a garden. Has a name and gardening goals.                                                 |
| **Garden Size**    | Value Object  | The dimensions of the garden grid: Small (7x7), Medium (15x15), or Large (30x30).                           |
| **Field**          | Concept       | The one-dimensional ordered layout of crops in the garden. Each position in the field maps to a plot in the grid. |
| **Plot**           | Concept       | A single cell in the garden grid. Addressed by (row, column) coordinates. Contains at most one crop.         |
| **Plant Crops**    | Action        | To fill the garden field with an ordered array of crops produced by the planting algorithm.                   |
| **Garden Planted** | Domain Event  | Raised when the garden field is populated with crops. Carries the total number of crops placed.               |

### Exceptions (Garden)

| Term                   | When it occurs                         |
| ---------------------- | -------------------------------------- |
| **Invalid Garden Size** | An unrecognized garden size is provided.|

## Planting Intelligence

| Term                       | Type          | Definition                                                                                                                     |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Planting Strategy**      | Domain Service| An algorithm that decides the optimal order to place crops in a garden, considering companion relationships.                     |
| **Greedy Planting Strategy**| Implementation| A planting strategy that places crops one at a time, always choosing the best available companion for the last placed crop.     |
| **Planting Layout Result** | Value Object  | The output of a planting strategy: an ordered list of crops, the companion state of each neighbor pair, and any unplaced crops. |
| **Companion State**        | Value Object  | The relationship between two neighboring crops in a layout: **Beneficial**, **Neutral**, or **Incompatible**.                   |
| **Companion Neighbor State**| Value Object  | A record linking two adjacent positions in the layout and their companion state.                                                |
| **Total Slots**            | Concept       | The total number of plots to fill (dimension x dimension). The algorithm cycles through selected crops until all slots are filled.|
| **Unplaced Crop**          | Concept       | A crop from the input that the algorithm could not place without violating companion rules.                                     |


## Shared Kernel

| Term              | Type          | Definition                                                                                                        |
| ----------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Aggregate Root**| Base Class    | Abstract base for all aggregates. Collects domain events internally; consumers pull and clear them after the fact. |
| **Domain Event**  | Interface     | Something meaningful that happened in the domain. Carries an event name and a timestamp.                          |
| **Pull Events**   | Action        | Retrieve all pending domain events from an aggregate and clear its internal list. Ensures events are consumed once.|
