FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia la solución y restaura las dependencias de todas las capas
COPY *.sln ./
COPY API/*.csproj ./API/
COPY Application/*.csproj ./Application/
COPY Domain/*.csproj ./Domain/
COPY Infrastructure/*.csproj ./Infrastructure/
RUN dotnet restore API/API.csproj

# Copia todo el código y compila la capa ejecutable (API)
COPY . .
WORKDIR /src/API
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]
