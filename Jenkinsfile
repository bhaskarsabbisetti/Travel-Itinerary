pipeline {
    agent any
    stages {
        stage('Test Clone') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/bhaskarsabbisetti/Travel-Itinerary.git'
                bat 'dir'
            }
        }
    }
}
