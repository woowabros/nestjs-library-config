# 1. Decision to record

Date: 2023-03-20

## Status

Accepted

## Context

Discussion on the role of DotEnvProviderService

## Decision

-   DotenvProvider allows a ConfigService to be created via a file written in DotEnv format.
-   It utilizes the DotEnv library and provides the options provided by DotEnv as an interface.
-   To prevent user mistakes, we `throw an Error if the File does not exist`.
    -   The logic for locating the file follows dotenv's file locator logic to avoid situations such as passing fileExist validation but encountering problems in dotenv.
-   If the file is not formatted correctly, we follow dotenv's specification without any validation.
    -   The Dotenv library also returns an empty object if an invalid file is passed in.
    -   Creating a DTO from an empty object sometimes results in default values being applied, and it's hard to tell if this is intentional.
    -   There was a lot of discussion about whether these cases should be managed as errors, and it was decided that the handling of files with formatting or parsing issues should follow the parsing results of the DotEnv library.

## Consequences

None
