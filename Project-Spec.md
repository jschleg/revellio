## Revellio – Internal Foundational Document

Version 0.1 – Working & Decision Basis

- Walenstadt, Saturday, December 13
- Purpose and Classification of the Document Table of Contents
- Starting Point and Problem Understanding
   - Origin of the Idea
   - Core Problems in Data Handling
   - Limitations of Existing Solutions
- Product Definition and Guiding Principles
   - What Revellio Is
   - Central Characteristics
   - What Revellio Is Not
   - Guiding Principles
   - Naming and Visual Concept
- Target Groups and Usage Context
   - Primary Target Groups
   - Secondary Target Groups
   - Expectations
- Role of AI and System Logic
   - AI Tasks
   - What AI Does Not Handle:
   - Transparency Principle
- Data Input and Analysis Understanding
   - Type of Data
   - Analysis Approach
   - Handling Data Quality
- Output, Visualization, and Explanation Concept
- Walenstadt, Saturday, December 13
   - Visualization Principle
   - Examples of UI Blocks
   - Explanation of Results
- User Interaction and User Guidance
   - Interaction in MVP
   - Extended Interaction (Planned)
   - Long-term Vision
- MVP Scope and Focus
   - MVP Goal
   - Included in MVP
   - Not Included in MVP
- Persistence and Further Processing
   - Storage
   - Export Options
- Technical Guidelines
   - Architecture Principles
   - Scalability
- Project Status and Outlook
   - Classification
   - Open Points
   - Next Steps
- Glossary

Walenstadt, Saturday, December 13, 2025

## Purpose and Classification of the Document Table of Contents

This document serves as an internal reference for the Revellio project. It records the central assumptions, definitions, and guidelines and should enable a shared, consistent understanding of the product. It forms the basis for product decisions, conceptual further development, and later technical implementation.

The document is intentionally not intended for external communication. It is not a marketing text, not a pitch deck, not a technical specification, and not a business plan. The focus is on clarity, traceability, and decision-making capability.

## Starting Point and Problem Understanding

### Origin of the Idea

The idea for Revellio arose from the observation that while structured data is widespread, meaningful analysis remains challenging. CSV files are a common exchange format but are often only superficially used or not analyzed at all.

### Core Problems in Data Handling

- Data is fragmented across multiple files
- Relationships between datasets are unclear
- Users don't know what questions to ask
- Visualization tools require analysis knowledge

### Limitations of Existing Solutions

Existing tools offer powerful features but require:

- Manual modeling
- Knowledge of data structures
- Decisions about visualizations
- Prior knowledge of relevant relationships

Revellio addresses the point where this knowledge is missing.

Walenstadt, Saturday, December 13, 2025

## Product Definition and Guiding Principles

### What Revellio Is

Revellio is an AI-powered analysis and visualization tool focused on gaining insights. The user provides data, and the system handles analysis, structuring, and presentation.

### Central Characteristics

- Automatic detection of relationships
- Multiple homogeneous inputs should be able to be combined
- Interpret heterogeneous inputs and develop assumptions for merging
- AI-driven structure and visualization decisions
- Explanatory classification of all relevant results
- Guided user experience

### What Revellio Is Not

- Not a classic BI tool
- Not a dashboard builder
- Not an Excel replacement
- Not a tool for confirming existing assumptions

### Guiding Principles

- Insight before control
- Guidance instead of configuration
- Transparency instead of black box
- Simplicity in MVP, extensibility in concept

Walenstadt, Saturday, December 13, 2025

### Naming and Visual Concept

The name Revellio stands for revealing, understanding, and making visible hidden structures in data. It is intentionally not purely descriptive but chosen as an artificial word to convey associations like insight, depth, and analysis without committing to specific technologies or features. This keeps the name timeless and extensible.

For the visual identity, especially the logo, this character should be picked up. Central guiding thoughts are clarity, structure, revelation, and precision. The design should appear reduced, serious, and technical without being cold or abstract. Name, product, and visual appearance should form a consistent overall picture that builds trust and reflects Revellio's claim as an explanatory analysis partner.

## Target Groups and Usage Context

### Primary Target Groups

People with limited data competence who nevertheless want to gain insights from data, for example:

- Founders
- Project managers
- Professionals without analysis background
- Students

### Secondary Target Groups

Data-savvy users who use Revellio as a supplement or accelerator:

- Analysts
- Developers
- Data Scientists (exploratory)

### Expectations

- Quick overview of data
- New perspectives
- Understandable explanations
- Possibility for further processing

Walenstadt, Saturday, December 13, 2025

## Role of AI and System Logic

### AI Tasks

The AI handles content analysis and strategic decision-making in two steps:

**Step 1: Data Mesh Analysis**
- Analysis of metadata and samples (20 data points per file)
- Recognition of semantic overlaps
- Identification of possible relations between:
  - Files
  - Columns (within and across files)
  - Data values
  - Conceptual connections

**Step 2: Visualization Analysis**
- Use of user-edited relations
- Determination of suitable visualization methods
- Derivation of meaningful data structures
- Selection of suitable visualization forms
- Explanation of how visualizations use the defined relations

Distinction from Classical Logic

### What AI Does Not Handle:

- Complete data processing
- Aggregation of large data volumes
- Rendering of visualizations
- UI logic

These tasks are implemented deterministically through classical code.

### Transparency Principle

- Every analysis is explained
- Assumptions are disclosed
- Decisions are justified
- Uncertainties are communicated

## Data Input and Analysis Understanding

### Type of Data

In the MVP, Revellio processes exclusively CSV files with structured tabular data form.

Scope and Limitations

- Intentionally limited file sizes
- Focus on structure, not on volume
- Premium extensions potentially possible

Walenstadt, Saturday, December 13, 2025

### Analysis Approach

- Extraction of columns, data types, and samples
- No complete raw data analysis in the first step
- Building a semantic overall picture

### Handling Data Quality

- Incomplete or inconsistent data is tolerated
- Problems are communicated transparently
- Poor data quality is not concealed

## Output, Visualization, and Explanation Concept

### Visualization Principle

- Results are displayed in UI blocks
- Selection of blocks is done by AI
- Implementation is done statically through code

### Examples of UI Blocks

- Diagrams
- Tables
- Relational views
- Aggregated overviews

### Explanation of Results

Each display is accompanied by:

- Description of the displayed data
- Explanation of the chosen structure
- Justification of the visualization form

## User Interaction and User Guidance

### Interaction in MVP

- Guided entry with clear workflow
- **Two-Step Process:**
  1. Data Mesh Analysis (automatic)
  2. Relation Editing (User Interaction)
  3. Visualization Analysis (automatic, based on edited relations)
- **Interactive Relation Editing:**
  - Adjust explanations
  - Change connection points
  - Remove unwanted relations
- Focus on understanding instead of configuring
- Optional context prompts for both AI steps

Walenstadt, Saturday, December 13, 2025

### Extended Interaction (Planned)

- Additional prompting
- Targeted questions to the AI
- Context and detail queries

### Long-term Vision

- Intuitive for beginners
- Powerful for advanced users
- No overwhelming complexity

## MVP Scope and Focus

### MVP Goal

- Proof of Concept
- Validation of the core mechanism
- Demonstration of added value

### Included in MVP

- CSV Import
- **Two-Step AI Workflow:**
  1. Data Mesh Analysis (recognize relations)
  2. Visualization Analysis (based on edited relations)
- **Interactive Relation Editing**
- Automatic Visualization
- Explanatory texts
- Storage of analysis state
- Visual exports

### Not Included in MVP

- Slides and storytelling
- Extensive configuration
- Complex filter logic
- Large data volumes

Walenstadt, Saturday, December 13, 2025

## Persistence and Further Processing

### Storage

Revellio stores:

- Analysis state
- Recognized structures
- Visualization decisions

The goal is reproducibility and continuation of analyses.

### Export Options

- Export of visualizations (e.g., PNG, PDF)
- Potentially export of structured data

## Technical Guidelines

### Architecture Principles

- Clear separation between AI and execution
- Modularity
- Extensibility
- Maintainability

### Scalability

- Not a primary MVP goal
- However, conceptually prepared
- Extensions without rethinking the core

Walenstadt, Saturday, December 13, 2025

## Project Status and Outlook

### Classification

Revellio is currently a side project with startup potential. The focus is on learning, validation, and conceptual sharpening.

### Open Points

- Long-term positioning
- Business model
- Market entry

### Next Steps

- Further sharpening of the MVP
- Technical prototypes
- Tests with real datasets

Walenstadt, Saturday, December 13, 2025

## Glossary

```
Term        Explanation
```
```
CSV File
```
```
Comma-Separated Values. A text-based file format for
storing tabular data, where each line represents a
record and each column represents a data field.
```
```
Structured Data
```
```
Data that exists in a fixed schema, typically in
tabular form with clearly defined columns and data types.
```
```
Homogeneous Input
```
```
Multiple datasets with comparable structural setup
and shared content context that can be meaningfully
analyzed or merged together.
```
```
Heterogeneous Input
```
```
Datasets with different structure or
different content context, whose
merging requires additional interpretation or assumptions.
```
```
Metadata
```
```
Data about data, such as column names, data types
or formatting that provide information about the structure
of the actual data.
```
```
Sample
```
```
A limited selection of records from a larger
dataset used to assess data structure and content.
```
```
Semantic Overlap
```
```
Content commonality between data fields or
datasets, even if they are differently named or
structured.
```
```
Relation
```
```
A logical or content relationship between datasets
or columns, for example through common keys,
time references, or categories.
```
```
Aggregation
```
```
Summary of data through computational operations such as
counting, summing, or averaging to make higher-level
patterns visible.
```

Walenstadt, Saturday, December 13, 2025

```
Term        Explanation
```
```
AI (Artificial Intelligence)
```
```
Analytical and strategic system component in Revellio that
interprets data, recognizes relationships, and prepares structure
and presentation decisions.
```
```
AI Analysis
```
```
Process in which the AI evaluates metadata and samples
to derive patterns, relations, and meaningful visualizations.
```
```
Deterministic Logic
```
```
Classical programming logic with unambiguous behavior, where
identical inputs always lead to identical outputs.
```
```
Data Pipeline Sequence of automated processing steps through which data
is transformed, aggregated, or forwarded.
```
```
Rendering Technical implementation and presentation of data in visual
form, such as a diagram or table.
```
```
UI (User Interface) The visual user interface through which the user interacts with the
system.
```
```
UI Block
```
```
Self-contained visual building block of the user interface,
for example a diagram, a table, or a relational view.
```
```
Visualization Graphical representation of data for better recognition of
patterns, trends, and relationships.
```
```
Analysis State
```
```
The stored overall state of an analysis, including
data references, recognized structures, and chosen
visualizations.
```
```
Persistence
```
```
Ability of a system to permanently store data or states
and restore them later.
```
```
Export Output of analysis results or visualizations to an external format, for example as an image or PDF.
```
```
Proof of Concept
```
```
Early product version that serves to demonstrate the basic
functionality and added value of an idea.
```

Walenstadt, Saturday, December 13, 2025

```
Term        Explanation
```
```
MVP (Minimum Viable Product)
```
```
Smallest functional product version that represents the core value
and serves to validate the basic idea.
```
```
Workflow Optimization
```
```
Improvement of workflows through reduction of manual
steps, time expenditure, or complexity.
```
```
Black Box System whose internal decision processes are not
traceable for the user.
```
```
Transparency Principle
```
```
Principle according to which assumptions, decisions, and
methodologies are openly communicated and made explainable.
```
